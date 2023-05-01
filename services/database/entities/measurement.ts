import moment from 'moment/moment'
import Entity from './entity'
import { MEASUREMENT_TABLE_NAME } from './index'
import Meter from './meter'

export default class Measurement extends Entity {

  static TABLE_NAME = MEASUREMENT_TABLE_NAME

  constructor(
    public value: number,
    public meter_id: number,
    public createdAt: number = Date.now(),
    public id?: number,
    public meter?: Meter,
  ) {
    super(id)
  }

  getInsertionValues(): string {
    // TODO Think about sanitizing the values
    return `(${ this.value }, ${ this.meter_id }, "${ moment(this.createdAt)
      .format('YYYY-MM-DD HH:mm') }")`
  }

  public getUpdateStatement(): string {
    return `
UPDATE ${ Measurement.TABLE_NAME } 
SET 
  value = ${ this.value }, 
  meter_id = ${ this.meter_id }, 
  createdAt = "${ moment(this.createdAt).format('YYYY-MM-DD HH:mm') }"
WHERE id = ${ this.id }`
  }
}
