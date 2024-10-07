import { CONTRACT_TABLE_NAME } from '@/contracts/contracts.constants'

export type ContractsEntity = {
  id: number
  name: string
  pricePerUnit: number
  identification?: string
  createdAt?: number
  conversion: number
  __v: number
}

export const getContractMigrationStatements = (from?: number, to?: number): Array<string> => {
  if (!from && to === 1) {
    return []
  }
  if (from === 1 && to === 2) {
    // Alter table to add __v column
    return []
  }
  if (from === 2 && to === 3) {
    // Alter table to add conversion column
    return []
  }
  return []
}

getContractMigrationStatements.tableName = CONTRACT_TABLE_NAME
