import { METER_TABLE_NAME } from '@/meters/meters.constants'

export type MetersEntity = {
  id: number
  name: string
  digits: number
  unit: string
  contract_id?: number
  areValuesDepleting: boolean
  isActive: boolean
  identification?: string
  createdAt?: number
  sortingOrder?: number
  isRefillable: boolean
  building_id?: number
  __v: number
}

export const getMeterMigrationStatements = (from?: number, to?: number): Array<string> => {
  if (!from && to === 1) {
    return []
  }
  if (from === 1 && to === 2) {
    return []
  }
  if (from === 3 && to === 4) {
    return []
  }
  if (from === 4 && to === 5) {
    return []
  }
  if (from === 5 && to === 6) {
    return []
  }
  return []
}

getMeterMigrationStatements.tableName = METER_TABLE_NAME
