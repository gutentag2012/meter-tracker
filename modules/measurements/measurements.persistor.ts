import { type DetailedBuilding, DetailedBuildingByIdSelector } from '@/buildings/buildings.selector'
import { RunOnDB } from '@/database'
import { type MeasurementsEntity } from '@/measurements/measurements.entity'
import {
  type DetailedMeasurement,
  DetailedMeasurementByIdSelector,
} from '@/measurements/measurements.selector'

export const CreateNewMeasurementStatement = `
  INSERT INTO measurement (meter_id, value, createdAt, __v)
  VALUES (?, ?, ?, ?)
`
export const InsertMeasurementStatement = `
    INSERT INTO measurement (id, meter_id, value, createdAt, __v)
    VALUES (?, ?, ?, ?, ?)
`
const insertStatementValuesTemplate = ',' + InsertMeasurementStatement.split('VALUES')[1].trim()

export const UpdateMeasurementStatement = `
  UPDATE measurement  
  SET meter_id = ?, value = ?, createdAt = ?, __v = ? 
  WHERE id = ?
`

export const DeleteMeasurementStatement = `
  DELETE FROM measurement
  WHERE id = ?
`

export const createNewMeasurement = async (
  meterId: number,
  value: number,
  createdAt?: number,
  getNewValue = false
): Promise<DetailedBuilding | undefined> => {
  const createdMeasurement = await RunOnDB(CreateNewMeasurementStatement, [
    meterId,
    value,
    createdAt ?? Date.now(),
    0,
  ]).catch((err) => {
    console.error('Error while creating new measurement', err)
  })

  if (!getNewValue || !createdMeasurement || !createdMeasurement.insertId) return

  return RunOnDB(DetailedBuildingByIdSelector, [createdMeasurement.insertId]).then(
    (res) => res.rows._array[0]
  )
}

export const insertMeasurementsFromEntities = async (measurements: Array<MeasurementsEntity>) => {
  if (!measurements.length) return

  const multiInsertStatement =
    InsertMeasurementStatement +
    (measurements.length > 1 ? insertStatementValuesTemplate.repeat(measurements.length - 1) : '')
  const values = measurements.flatMap((measurement) => [
    measurement.id,
    measurement.meter_id,
    measurement.value,
    measurement.createdAt ?? Date.now(),
    measurement.__v ?? 0,
  ])

  return RunOnDB(multiInsertStatement, values).catch((err) => {
    console.error('Error while inserting measurements', err)
  })
}
export const insertMeasurement = async (
  id: number,
  meterId: number,
  value: number,
  createdAt?: number,
  getNewValue = false
): Promise<DetailedBuilding | undefined> => {
  await RunOnDB(InsertMeasurementStatement, [
    id,
    meterId,
    value,
    createdAt ?? Date.now(),
    0,
    meterId,
    value,
    createdAt ?? Date.now(),
    0,
  ]).catch((err) => {
    console.error('Error while inserting measurement', err)
  })

  if (!getNewValue) return

  return RunOnDB(DetailedBuildingByIdSelector, [id]).then((res) => res.rows._array[0])
}
export const updateMeasurement = async (
  id: number,
  meterId: number,
  value: number,
  createdAt?: number,
  getNewValue = false
): Promise<DetailedMeasurement | undefined> => {
  await RunOnDB(UpdateMeasurementStatement, [meterId, value, createdAt ?? Date.now(), 0, id]).catch(
    (err) => {
      console.error('Error while updating measurement', err)
    }
  )

  if (!getNewValue) return

  return RunOnDB(DetailedMeasurementByIdSelector, [id]).then((res) => res.rows._array[0])
}
export const deleteMeasurement = async (id: number, getOldValue = false) => {
  let oldMeasurement: MeasurementsEntity | undefined = undefined
  if (getOldValue) {
    oldMeasurement = await RunOnDB(DetailedMeasurementByIdSelector, [id]).then(
      (res) => res.rows._array[0]
    )
  }

  await RunOnDB(DeleteMeasurementStatement, [id]).catch((err) => {
    console.error('Error while deleting measurement', err)
  })

  return oldMeasurement
}
