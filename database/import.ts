import {parseCSV, parsedCsvToJSON} from "@/modules/settings/serialization";
import {db, Schema} from "@/database/db";
import {BuildingInsert, ContractInsert, ContractRevisionInsert, MeterInsert, ReadingInsert} from "@/database/schema";
import { clearDatabase } from '@/database/utils'

export type ImportMappings = {
  buildings: {
    id: string | null,
    name: string | null,
    address: string | null,
    notes: string | null,
    isDefault: string | null
  },
  contracts: {
    id: string | null,
    name: string | null,
    identifier: string | null,
    unit: string | null,
    buildingId: string | null
  },
  contractRevisions: {
    pricePerUnit: string | null,
    basePayment: string | null,
    monthlyPayment: string | null,
    startDate: string | null,
    endDate: string | null,
    contractId: string | null
  },
  meters: {
    name: string | null,
    precision: string | null,
    valueBeforeReset: string | null,
    isActive: string | null,
    sortOrder: string | null,
    customUnitConversion: string | null,
    buildingId: string | null,
    contractId: string | null,
    type: string | null,
    unit: string | null
  },
  readings: {
    value: string | null,
    timestamp: string | null,
    meterId: string | null
  }
}

type LegacyBuilding = {
  id: string
  name: string
  address: string
  notes: string
}
type LegacyContract = {
  id: string
  name: string
  identification: string
  conversion: string
  pricePerUnit: string
}
type LegacyMeter = {
  id: string
  building_id: string
  contract_id: string
  areValuesDepleting: string
  digits: string
  identification: string
  isActive: string
  isRefillable: string
  name: string
  sortingOrder: string
  unit: string
}
type LegacyReading = {
  id: string
  meter_id: string
  value: string
  createdAt: string
}

export async function importLegacyCSV(csv:string, clearExisting=false) {
  const parsedCsv = parseCSV(csv)
  const csvJSON = parsedCsvToJSON(parsedCsv)

  const uniqueImportObjects = {
    buildings: {} as Record<string, LegacyBuilding>,
    contracts: {} as Record<string, LegacyContract>,
    meters: {} as Record<string, LegacyMeter>,
    readings: {} as Record<string, LegacyReading>
  }
  for (const element of csvJSON) {
    let building = {} as LegacyBuilding
    let contract = {} as LegacyContract
    let meter = {} as LegacyMeter
    let reading = {} as LegacyReading
    for (const key of Object.keys(element)) {
      if(key.startsWith("building_")) {
        const buildingKey = key.replace("building_", "") as keyof LegacyBuilding
        (building[buildingKey] as any) = element[key]
        continue
      }
      if(key.startsWith("meter_")) {
        const meterKey = key.replace("meter_", "") as keyof typeof meter
        (meter[meterKey] as any) = element[key]
        continue
      }
      if(key.startsWith("contract_")) {
        const contractKey = key.replace("contract_", "") as keyof typeof contract
        (contract[contractKey] as any) = element[key]
        continue
      }
      if(key.startsWith("measurement_")) {
        const readingKey = key.replace("measurement_", "") as keyof typeof reading
        (reading[readingKey] as any) = element[key]
      }
    }

    if(building.id) uniqueImportObjects.buildings[building.id] = building
    if(contract.id) uniqueImportObjects.contracts[contract.id] = contract
    if(meter.id) uniqueImportObjects.meters[meter.id] = meter
    if(reading.id) uniqueImportObjects.readings[reading.id] = reading
  }

  const buildings = Object.values(uniqueImportObjects.buildings)
  const contracts = Object.values(uniqueImportObjects.contracts)
  const meters = Object.values(uniqueImportObjects.meters)
  const readings = Object.values(uniqueImportObjects.readings)

  console.log("Importing Buildings", buildings.length)
  console.log("Importing Contracts", contracts.length)
  console.log("Importing Meters", meters.length)
  console.log("Importing Readings", readings.length)

  if(clearExisting) {
    console.log("Clearing existing database")
    await clearDatabase()
  }

  const buildingsToInsert = buildings.map((building): BuildingInsert => {
    if(building.name === "default") {
      return {
        id: 1,
        isDefault: true,
        name: "default",
        address: "",
        notes: ""
      }
    }
    return {
      id: parseInt(building.id),
      isDefault: false,
      name: building.name,
      address: building.address,
      notes: building.notes
    }
  })
  const resBuilding = await db.insert(Schema.building).values(buildingsToInsert).catch(err => console.error("Error importing buildings", err))
  console.log("Inserted buildings", resBuilding)

  const kwhUnitId = 1
  const m3UnitId = 7

  const contractsToInsert = contracts.map((contract): ContractInsert => {
    const buildingId = meters.find(meter => meter.contract_id === contract.id)?.building_id
    return {
      id: parseInt(contract.id),
      name: contract.name,
      identifier: contract.identification,
      unitId: kwhUnitId,
      buildingId: buildingId ? parseInt(buildingId) : 1
    }
  })
  const resContract = await db.insert(Schema.contract).values(contractsToInsert).catch(err => console.error("Error importing contracts", err))
  console.log("Inserted contracts", resContract)

  const contractRevisionsToInsert = contracts.map((contract): ContractRevisionInsert => {
    return {
      pricePerUnit: parseFloat(contract.pricePerUnit) / 100,
      contractId: parseInt(contract.id)
    }
  })
  const resRevision = await db.insert(Schema.contractRevision).values(contractRevisionsToInsert).catch(err => console.error("Error importing contractRevisions", err))
  console.log("Inserted revisions", resRevision)

  const consumptionMeterTypeId = 1
  const generationMeterTypeId = 2
  const consumptionTankMeterTypeId = 3

  const metersToInsert = meters.map((meter): MeterInsert => {
    const contract = contracts.find(contract => contract.id === meter.contract_id)
    const typeId = meter.isRefillable ? consumptionTankMeterTypeId : meter.areValuesDepleting ? generationMeterTypeId : consumptionMeterTypeId
    return {
      id: parseInt(meter.id),
      name: meter.name,
      identifier: meter.identification,
      precision: parseInt(meter.digits),
      sortOrder: parseInt(meter.sortingOrder),
      buildingId: parseInt(meter.building_id),
      contractId: parseInt(meter.contract_id),
      typeId,
      unitId: contract?.conversion === "10" ? m3UnitId : kwhUnitId
    }
  })
  const resMeters = await db.insert(Schema.meter).values(metersToInsert).catch(err => console.error("Error importing meters", err))
  console.log("Inserted meters", resMeters)

  const readingsToInsert = readings.map((reading): ReadingInsert => {
    return {
      value: parseFloat(reading.value),
      timestamp: new Date(parseInt(reading.createdAt)),
      meterId: parseInt(reading.meter_id)
    }
  })
  const resReadings = await db.insert(Schema.reading).values(readingsToInsert).catch(err => console.error("Error importing readings", err))
  console.log("Inserted readings", resReadings)
}

export async function importCSV(csv:string, options: { mapping: ImportMappings, clearExisting: false }) {
  const parsedCsv = parseCSV(csv)

  if(options.clearExisting) {
    await clearDatabase()
  }
}