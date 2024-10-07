import { DetailedBuildingByIdSelector } from '@/buildings/buildings.selector'
import { type ContractsEntity } from '@/contracts/contracts.entity'
import { type DetailedContract } from '@/contracts/contracts.selector'
import { RunOnDB } from '@/database'

export const CreateNewContractStatement = `
    INSERT INTO contract (name, pricePerUnit, identification, createdAt, conversion, __v)
    VALUES (?, ?, ?, ?, ?, ?)
`
export const InsertContractStatement = `
    INSERT INTO contract (id, name, pricePerUnit, identification, createdAt, conversion, __v)
    VALUES (?, ?, ?, ?, ?, ?, ?)
`
const insertStatementValuesTemplate = ',' + InsertContractStatement.split('VALUES')[1].trim()

export const UpdateContractStatement = `
  UPDATE contract
  SET name = ?, pricePerUnit = ?, identification = ?, conversion = ?, __v = ?
  WHERE id = ?
`

export const DeleteContractStatement = `
  DELETE FROM contract
  WHERE id = ?
`

export const createNewContract = async (
  name: string,
  pricePerUnit: number,
  identification: string,
  conversion: number,
  getNewValue = false
): Promise<DetailedContract | undefined> => {
  const insertedResult = await RunOnDB(CreateNewContractStatement, [
    name,
    pricePerUnit,
    identification,
    Date.now(),
    conversion,
    0,
  ]).catch((err) => {
    console.error('Error while inserting new contract', err)
  })
  if (!getNewValue || !insertedResult || !insertedResult.insertId) return

  return RunOnDB(DetailedBuildingByIdSelector, [insertedResult.insertId]).then(
    (res) => res.rows._array[0]
  )
}

export const insertContractsFromEntities = async (contracts: Array<ContractsEntity>) => {
  if (!contracts.length) return

  const multiInsertStatement =
    InsertContractStatement +
    (contracts.length > 1 ? insertStatementValuesTemplate.repeat(contracts.length - 1) : '')
  const values = contracts.flatMap((contract) => [
    contract.id,
    contract.name,
    contract.pricePerUnit,
    contract.identification ?? null,
    contract.createdAt ?? Date.now(),
    contract.conversion,
    contract.__v ?? 0,
  ])

  return RunOnDB(multiInsertStatement, values).catch((err) => {
    console.error('Error while inserting contracts', err)
  })
}
export const insertContract = async (
  id: number,
  name: string,
  pricePerUnit: number,
  identification: string | null,
  conversion: number,
  createdAt: number,
  getNewValue = false
): Promise<DetailedContract | undefined> => {
  await RunOnDB(InsertContractStatement, [
    id,
    name,
    pricePerUnit,
    identification,
    createdAt,
    conversion,
    0,
  ]).catch((err) => {
    console.error('Error while inserting contract', err)
  })

  if (!getNewValue) return

  return RunOnDB(DetailedBuildingByIdSelector, [id]).then((res) => res.rows._array[0])
}

export const updateContract = async (
  id: number,
  name: string,
  pricePerUnit: number,
  identification: string,
  conversion: number,
  getNewValue = false
): Promise<DetailedContract | undefined> => {
  await RunOnDB(UpdateContractStatement, [
    name,
    pricePerUnit,
    identification,
    conversion,
    0,
    id,
  ]).catch((err) => {
    console.error('Error while updating contract', err)
  })

  if (!getNewValue) return

  return RunOnDB(DetailedBuildingByIdSelector, [id]).then((res) => res.rows._array[0])
}

export const deleteContract = async (id: number): Promise<void> => {
  await RunOnDB(DeleteContractStatement, [id]).catch((err) => {
    console.error('Error while deleting contract', err)
  })
}
