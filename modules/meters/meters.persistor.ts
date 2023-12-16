import { DEFAULT_BUILDING_ID } from '@/buildings/buildings.constants'
import { type DetailedBuilding } from '@/buildings/buildings.selector'

import { RunOnDB } from '@/database'
import { type MetersEntity } from '@/meters/meters.entity'
import { DetailedMeterByIdSelector } from '@/meters/meters.selector'

export const CreateNewMeterStatement = `
    INSERT INTO meter (name, digits, unit, contract_id, areValuesDepleting, isActive, identification, createdAt, sortingOrder, isRefillable, building_id, __v)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
`
export const InsertMeterStatement = `
    INSERT INTO meter (id, name, digits, unit, contract_id, areValuesDepleting, isActive, identification, createdAt,
                       sortingOrder, isRefillable, building_id, __v)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
`
const insertStatementValuesTemplate = ',' + InsertMeterStatement.split('VALUES')[1].trim()

export const UpdateMeterStatement = `
  UPDATE meter
  SET name               = ?,
      digits             = ?,
      unit               = ?,
      contract_id        = ?,
      areValuesDepleting = ?,
      isActive           = ?,
      identification     = ?,
      createdAt          = ?,
      sortingOrder       = ?,
      isRefillable       = ?,
      building_id        = ?,
      __v                = ?
  WHERE id = ?
`

export const DeleteMeterStatement = `
  DELETE FROM meter
  WHERE id = ?
`

export const createNewMeter = async (
  name: string,
  digits: number,
  unit: string,
  contractId: number | null,
  areValuesDepleting: boolean,
  isActive: boolean,
  identification: string,
  sortingOrder: number,
  isRefillable: boolean,
  buildingId: number,
  getNewValue = false
): Promise<DetailedBuilding | undefined> => {
  const insertedResult = await RunOnDB(CreateNewMeterStatement, [
    name,
    digits,
    unit,
    contractId,
    Number(areValuesDepleting),
    Number(isActive),
    identification,
    Date.now(),
    sortingOrder,
    Number(isRefillable),
    buildingId,
    0,
  ]).catch((err) => {
    console.error('Error while creating new meter', err)
  })

  if (!getNewValue || !insertedResult || !insertedResult.insertId) return

  return RunOnDB(DetailedMeterByIdSelector, [insertedResult.insertId]).then(
    (res) => res.rows._array[0]
  )
}

export const insertMetersFromEntities = async (meters: Array<MetersEntity>) => {
  if (!meters.length) return

  const multiInsertStatement =
    InsertMeterStatement +
    (meters.length > 1 ? insertStatementValuesTemplate.repeat(meters.length - 1) : '')
  const values = meters.flatMap((meterEntity) => [
    meterEntity.id,
    meterEntity.name,
    meterEntity.digits,
    meterEntity.unit,
    meterEntity.contract_id ?? null,
    +meterEntity.areValuesDepleting,
    +meterEntity.isActive,
    meterEntity.identification ?? null,
    meterEntity.createdAt ?? Date.now(),
    meterEntity.sortingOrder || 0,
    +meterEntity.isRefillable,
    meterEntity.building_id ?? DEFAULT_BUILDING_ID,
    meterEntity.__v ?? 0,
  ])

  return RunOnDB(multiInsertStatement, values).catch((err) => {
    console.error('Error while inserting meters', err)
  })
}
export const insertMeter = async (
  id: number,
  name: string,
  digits: number,
  unit: string,
  contractId: number | null,
  areValuesDepleting: boolean,
  isActive: boolean,
  identification: string | null,
  createdAt: number,
  sortingOrder: number,
  isRefillable: boolean,
  buildingId: number | null,
  getNewValue = false
): Promise<DetailedBuilding | undefined> => {
  await RunOnDB(InsertMeterStatement, [
    id,
    name,
    digits,
    unit,
    contractId,
    Number(areValuesDepleting),
    Number(isActive),
    identification,
    createdAt,
    sortingOrder,
    Number(isRefillable),
    buildingId,
    0,
    name,
    digits,
    unit,
    contractId,
    Number(areValuesDepleting),
    Number(isActive),
    identification,
    createdAt,
    sortingOrder,
    Number(isRefillable),
    buildingId,
    0,
  ]).catch((err) => {
    console.error('Error while inserting meter', err)
  })

  if (!getNewValue) return

  return RunOnDB(DetailedMeterByIdSelector, [id]).then((res) => res.rows._array[0])
}

export const updateMeter = async (
  id: number,
  name: string,
  digits: number,
  unit: string,
  contractId: number | null,
  areValuesDepleting: boolean,
  isActive: boolean,
  identification: string,
  createdAt: number,
  sortingOrder: number,
  isRefillable: boolean,
  buildingId: number,
  getNewValue = false
): Promise<DetailedBuilding | undefined> => {
  await RunOnDB(UpdateMeterStatement, [
    name,
    digits,
    unit,
    contractId,
    Number(areValuesDepleting),
    Number(isActive),
    identification,
    createdAt,
    sortingOrder,
    Number(isRefillable),
    buildingId,
    0,
    id,
  ]).catch((err) => {
    console.error('Error while updating meter', err)
  })

  if (!getNewValue) return

  return RunOnDB(DetailedMeterByIdSelector, [id]).then((res) => res.rows._array[0])
}

export const deleteMeter = async (id: number) => {
  await RunOnDB(DeleteMeterStatement, [id]).catch((err) => {
    console.error('Error while deleting meter', err)
  })
}
