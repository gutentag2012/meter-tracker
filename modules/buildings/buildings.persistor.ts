import { type BuildingsEntity } from '@/buildings/buildings.entity'
import { type DetailedBuilding, DetailedBuildingByIdSelector } from '@/buildings/buildings.selector'
import { RunOnDB } from '@/database'

export const CreateNewBuildingStatement = `
  INSERT INTO building (name, address, notes, createdAt, __v)
  VALUES (?, ?, ?, ?, ?)
`
export const InsertBuildingStatement = `
    INSERT INTO building (id, name, address, notes, createdAt, __v)
    VALUES (?, ?, ?, ?, ?, ?)
`
const insertStatementValuesTemplate = ',' + InsertBuildingStatement.split('VALUES')[1].trim()

export const UpdateBuildingStatement = `
  UPDATE building
  SET name = ?, address = ?, notes = ?, __v = ?
  WHERE id = ?
`

export const DeleteBuildingStatement = `
  DELETE FROM building
  WHERE id = ?
`

export const createNewBuilding = async (
  name: string,
  address: string,
  notes: string,
  getNewValue = false
): Promise<DetailedBuilding | undefined> => {
  const insertedResult = await RunOnDB(CreateNewBuildingStatement, [
    name,
    address,
    notes,
    Date.now(),
    0,
  ]).catch((err) => {
    console.error('Error while inserting new building', err)
  })
  if (!getNewValue || !insertedResult || !insertedResult.insertId) return

  return RunOnDB(DetailedBuildingByIdSelector, [insertedResult.insertId]).then(
    (res) => res.rows._array[0]
  )
}

export const insertBuildingsFromEntities = async (buildings: Array<BuildingsEntity>) => {
  if (!buildings.length) return

  const multiInsertStatement =
    InsertBuildingStatement +
    (buildings.length > 1 ? insertStatementValuesTemplate.repeat(buildings.length - 1) : '')
  const values = buildings.flatMap((buildingEntity) => [
    buildingEntity.id,
    buildingEntity.name,
    buildingEntity.address ?? null,
    buildingEntity.notes ?? null,
    buildingEntity.createdAt ?? Date.now(),
    buildingEntity.__v ?? 0,
  ])

  return RunOnDB(multiInsertStatement, values).catch((err) => {
    console.error('Error while inserting buildings', err)
  })
}
export const insertBuilding = async (
  id: number,
  name: string,
  createdAt?: number,
  address?: string,
  notes?: string,
  getNewValue = false
): Promise<DetailedBuilding | undefined> => {
  await RunOnDB(InsertBuildingStatement, [
    id,
    name,
    address ?? null,
    notes ?? null,
    createdAt ?? Date.now(),
    name,
    address ?? null,
    notes ?? null,
    0,
  ]).catch((err) => {
    console.error('Error while inserting building', err)
  })

  if (!getNewValue) return

  return RunOnDB(DetailedBuildingByIdSelector, [id]).then((res) => res.rows._array[0])
}

export const updateBuilding = async (
  id: number,
  name: string,
  address: string,
  notes: string,
  getNewValue = false
): Promise<DetailedBuilding | undefined> => {
  await RunOnDB(UpdateBuildingStatement, [name, address, notes, id]).catch((err) => {
    console.error('Error while updating building', err)
  })

  if (!getNewValue) return

  return RunOnDB(DetailedBuildingByIdSelector, [id]).then((res) => res.rows._array[0])
}

export const deleteBuilding = async (id: number): Promise<void> => {
  await RunOnDB(DeleteBuildingStatement, [id]).catch((err) => {
    console.error('Error while deleting building', err)
  })
}
