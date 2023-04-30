import moment from 'moment'
import Contract from './contract'
import Entity from './entity'
import { METER_TABLE_NAME } from './index'

export default class Meter extends Entity {

  static TABLE_NAME = METER_TABLE_NAME

  constructor(
    public name: string,
    public digits: number,
    public unit: string,
    public contract_id?: number,
    public areValuesIncreasing?: boolean,
    public isActive?: boolean,
    public identification?: string,
    public createdAt: number = Date.now(),
    public id?: number,
    private _contract?: Contract,
    public lastMeasurementDate?: number,
    public lastMeasurementValue?: number,
  ) {
    super(id)
  }

  getInsertionValues(): string {
    // TODO Think about sanitizing the values
    const identification = this.identification ? `"${ this.identification }"` : 'NULL'
    return `("${ this.name }", ${ this.digits }, "${ this.unit }", ${ this.contract_id ?? 'NULL' }, ${ this.areValuesIncreasing ?? 'NULL' }, ${ this.isActive ?? 'NULL' }, ${ identification }, "${ moment(
      this.createdAt)
      .format('YYYY-MM-DD HH:mm') }")`
  }
}
