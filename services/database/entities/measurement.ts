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
    public __v = 0,
    public meter?: Meter,
  ) {
    super(id)
  }

  getInsertionValues(forceId?: boolean): string {
    return `(${ this.value }, ${ this.meter_id }, ${ this.createdAt }${ forceId
                                                                        ? `, ${ this.id }`
                                                                        : '' }, ${ this.__v ?? 0 })`
  }

  public getUpdateStatement(): string {
    return `
UPDATE ${ Measurement.TABLE_NAME } 
SET 
  value = ${ this.value }, 
  meter_id = ${ this.meter_id }, 
  createdAt = ${ this.createdAt }, 
  __v = ${ this.__v }
WHERE id = ${ this.id }`
  }

  public getCSVValues(withChildren?: boolean): string {
    const ownHeader = [this.id, this.meter_id, this.value, this.createdAt, this.__v].map(e => JSON.stringify(e))
      .join(',')
    if (!withChildren) {
      return ownHeader
    }
    return `${ ownHeader }${ this.meter ? (`,${ this.meter?.getCSVValues(true) }`) : '' }`
  }
}
