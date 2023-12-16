import { type BuildingsEntity } from '@/buildings/buildings.entity'
import { type ContractsEntity } from '@/contracts/contracts.entity'
import { type MeasurementsEntity } from '@/measurements/measurements.entity'
import { type MetersEntity } from '@/meters/meters.entity'

import { tableSelector } from '@utils/TableSelector'

export { RunOnDB, reloadDatabase, dropDatabase, runMigrations, setForeignKeys } from './db'

const measurementSelector = tableSelector<MeasurementsEntity>(
  {
    id: '',
    value: '',
    meter_id: '',
    createdAt: '',
    __v: '',
  },
  'measurement'
)
const meterSelector = tableSelector<MetersEntity>(
  {
    id: '',
    name: '',
    digits: '',
    unit: '',
    contract_id: '',
    areValuesDepleting: '',
    isActive: '',
    identification: '',
    createdAt: '',
    sortingOrder: '',
    isRefillable: '',
    building_id: '',
    __v: '',
  },
  'meter'
)
const contractSelector = tableSelector<ContractsEntity>(
  {
    id: '',
    name: '',
    pricePerUnit: '',
    identification: '',
    createdAt: '',
    conversion: '',
    __v: '',
  },
  'contract'
)
const buildingSelector = tableSelector<BuildingsEntity>(
  {
    id: '',
    name: '',
    address: '',
    notes: '',
    createdAt: '',
    __v: '',
  },
  'building'
)

// The first statement will include all the assigned data, since every meter by default has a building and possibly a contract and a measurement cannot live without a meter.
// The second statement will include all the unassigned data, since there might be contracts unassigned to a meter. (That's why there is a "pseudo-join" on the meter table)
export const AllDataExportSelector = `
  SELECT ${measurementSelector}, ${meterSelector}, ${contractSelector}, ${buildingSelector}
  FROM building 
      LEFT JOIN meter ON building.id = meter.building_id
      LEFT JOIN contract ON meter.contract_id = contract.id
      LEFT JOIN measurement ON meter.id = measurement.meter_id
  UNION ALL
  SELECT ${measurementSelector}, ${meterSelector}, ${contractSelector}, ${buildingSelector}
  FROM contract 
      LEFT JOIN meter ON 1 = 0
      LEFT JOIN building ON meter.building_id = building.id
      LEFT JOIN measurement ON meter.id = measurement.meter_id
  WHERE contract.id NOT IN (SELECT contract_id FROM meter)
`

type EntityWithPrefix<Entity, Prefix extends string> = {
  [Key in keyof Entity as `${Prefix}${Key extends string ? Key : never}`]: Entity[Key]
}
export type AllDataExport = EntityWithPrefix<MeasurementsEntity, 'measurement_'> &
  EntityWithPrefix<MetersEntity, 'meter_'> &
  EntityWithPrefix<ContractsEntity, 'contract_'> &
  EntityWithPrefix<BuildingsEntity, 'building_'>

export type AllDataImport = {
  meter?: MetersEntity
  contract?: ContractsEntity
  building?: BuildingsEntity
  measurement?: MeasurementsEntity
}
