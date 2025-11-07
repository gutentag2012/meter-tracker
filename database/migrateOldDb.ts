import { db, oldDatabase, Schema } from '@/database/db'
import { clearDatabase } from '@/database/utils'
import { BuildingInsert, ContractInsert, ContractRevisionInsert, MeterInsert, ReadingInsert } from '@/database/schema'

type OldBuilding = {
  id: number
  name: string
  address?: string
  notes?: string
  createdAt: number
}
type OldContract = {
  id: number
  name: string
  pricePerUnit: number
  identification?: string
  createdAt: number
  conversion: number
}
type OldMeter = {
  id: number
  name: string
  digits: number
  unit: string
  contract_id?: number
  building_id?: number
  areValuesDepleting?: number
  isActive?: number
  identification?: string
  createdAt: number
  sortingOrder?: number
  isRefillable: number
}
type OldMeasurement = {
  id: number
  value: number
  meter_id: number
  createdAt: number
}

export async function migrateOldDb() {
  console.log("Migrating old database")
  try {
    const buildings = await oldDatabase.getAllAsync("SELECT * FROM building").catch(() => []) as OldBuilding[]
    const contracts = await oldDatabase.getAllAsync("SELECT * FROM contract").catch(() => []) as OldContract[]
    const meters = await oldDatabase.getAllAsync("SELECT * FROM meter").catch(() => []) as OldMeter[]
    const measurements = await oldDatabase.getAllAsync("SELECT * FROM measurement").catch(() => []) as OldMeasurement[]

    if(!measurements?.length) {
      return
    }

    await clearDatabase()

    const kwhUnitId = 1
    const m3UnitId = 7

    const consumptionMeterTypeId = 1
    const generationMeterTypeId = 2
    const consumptionTankMeterTypeId = 3

    const buildingsToInsert = buildings.filter(Boolean).map((building): BuildingInsert => {
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
        id: building.id,
        isDefault: false,
        name: building.name,
        address: building.address,
        notes: building.notes
      }
    })
    if(buildingsToInsert.length) {
      const resBuilding = await db.insert(Schema.building).values(buildingsToInsert).catch(err => console.error("Error migrating old buildings", err))
      console.log("Inserted buildings", resBuilding)
    }

    const contractsToInsert = contracts.filter(Boolean).map((contract): ContractInsert => {
      if(!contract.id) {
        return null as unknown as ContractInsert
      }
      const buildingId = meters.find(meter => meter.contract_id === contract.id)?.building_id
      return {
        id: contract.id,
        name: contract.name,
        identifier: contract.identification,
        unitId: kwhUnitId,
        buildingId: buildingId ? buildingId : 1
      }
    }).filter(Boolean)
    if(contractsToInsert.length) {
      const resContract = await db.insert(Schema.contract).values(contractsToInsert).catch(err => console.error("Error migrating old contracts", err))
      console.log("Inserted contracts", resContract)
    }

    const contractRevisionsToInsert = contracts.filter(Boolean).map((contract): ContractRevisionInsert => {
      if(!contract.id) {
        return null as unknown as ContractRevisionInsert
      }
      return {
        startDate: new Date(contract.createdAt),
        pricePerUnit: contract.pricePerUnit / 100,
        contractId: contract.id
      }
    }).filter(Boolean)
    if(contractRevisionsToInsert.length) {
      const resRevision = await db.insert(Schema.contractRevision).values(contractRevisionsToInsert).catch(err => console.error("Error migrating old contractRevisions", err))
      console.log("Inserted revisions", resRevision)
    }

    const metersToInsert = meters.filter(Boolean).map((meter): MeterInsert => {
      if(!meter.id) {
        return null as unknown as MeterInsert
      }
      const contract = contracts.find(contract => contract.id === meter.contract_id)
      const typeId = meter.isRefillable ? consumptionTankMeterTypeId : meter.areValuesDepleting ? generationMeterTypeId : consumptionMeterTypeId
      return {
        id: meter.id,
        name: meter.name,
        identifier: meter.identification,
        precision: meter.digits,
        sortOrder: meter.sortingOrder,
        buildingId: meter.building_id,
        contractId: meter.contract_id,
        typeId,
        unitId: contract?.conversion === 10 ? m3UnitId : kwhUnitId
      }
    }).filter(Boolean)
    if(metersToInsert.length) {
      const resMeters = await db.insert(Schema.meter).values(metersToInsert).catch(err => console.error("Error migrating old meters", err))
      console.log("Inserted meters", resMeters)
    }

    const readingsToInsert = measurements.filter(Boolean).map((reading): ReadingInsert => {
      if(!reading.id) {
        return null as unknown as ReadingInsert
      }
      return {
        value: reading.value ? reading.value : 0,
        timestamp: new Date(reading.createdAt),
        meterId: reading.meter_id
      }
    }).filter(Boolean)
    if(readingsToInsert.length) {
      const resReadings = await db.insert(Schema.reading).values(readingsToInsert).catch(err => console.error("Error migrating old readings", err))
      console.log("Inserted readings", resReadings)
    }

  } catch (e) {
    console.error('Error migrating old database', e)
  }
}