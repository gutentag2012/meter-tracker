import { BUILDING_TABLE_NAME } from '@/buildings/buildings.constants'

export type BuildingsEntity = {
  id: number
  name: string
  address?: string
  notes?: string
  createdAt: number
  __v: number
}

export const getBuildingMigrationStatements = (from?: number, to?: number): Array<string> => {
  if (from === 4 && to === 5) {
    return []
  }
  return []
}

getBuildingMigrationStatements.tableName = BUILDING_TABLE_NAME
