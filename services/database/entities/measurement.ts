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

  getInsertionValues(forceId?: boolean): string {
    return `(${ this.value }, ${ this.meter_id }, ${ this.createdAt }${ forceId ? `, ${ this.id }` : '' })`
  }

  public getUpdateStatement(): string {
    return `
UPDATE ${ Measurement.TABLE_NAME } 
SET 
  value = ${ this.value }, 
  meter_id = ${ this.meter_id }, 
  createdAt = ${ this.createdAt }
WHERE id = ${ this.id }`
  }

  public getCSVValues(withChildren?: boolean): string {
    const ownHeader = [this.id, this.meter_id, this.value, this.createdAt].map(e => JSON.stringify(e))
      .join(',')
    if (!withChildren) {
      return ownHeader
    }
    const meterHeader = [
      this.meter?.id,
      this.meter?.contract_id,
      this.meter?.name,
      this.meter?.digits,
      this.meter?.unit,
      this.meter?.areValuesDepleting,
      this.meter?.isActive,
      this.meter?.identification,
      this.meter?.createdAt,
    ].map(e => JSON.stringify(e))
      .join(',')
    const contractHeader = [
      this.meter?.contract?.id,
      this.meter?.contract?.name,
      this.meter?.contract?.pricePerUnit,
      this.meter?.contract?.identification,
      this.meter?.contract?.createdAt,
    ].map(e => JSON.stringify(e))
      .join(',')
    return [ownHeader, meterHeader, contractHeader].join(',')
  }
}
