import { MEASUREMENT_TABLE_NAME } from '@/measurements/measurements.constants'

export type MeasurementsEntity = {
  id: number
  value: number
  meter_id: number
  createdAt: number
  __v: number
}

export const getMeasurementMigrationStatements = (from?: number, to?: number): Array<string> => {
  if (!from && to === 1) {
    return []
  }
  if (from === 1 && to === 2) {
    // Alter table to add __v column
    return []
  }
  if (from === 5 && to === 6) {
    return []
  }
  return []
}

getMeasurementMigrationStatements.tableName = MEASUREMENT_TABLE_NAME
