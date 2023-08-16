import Contract from './contract'
import Entity from './entity'
import { METER_TABLE_NAME } from './index'
import Measurement from './measurement'

export default class Meter extends Entity {

  static TABLE_NAME = METER_TABLE_NAME

  constructor(
    public name: string,
    public digits: number,
    public unit: string,
    public contract_id?: number,
    public areValuesDepleting?: boolean,
    public isActive?: boolean,
    public identification?: string,
    public createdAt: number = Date.now(),
    public order?: number,
    public id?: number,
    public __v = 0,
    public contract?: Contract,
    public lastMeasurements?: Array<{value: number, date: number}>,
  ) {
    super(id)
  }

  getInsertionValues(forceId?: boolean): string {
    const identification = this.identification ? `"${ this.identification }"` : 'NULL'
    return `("${ this.name }", ${ this.digits }, "${ this.unit }", ${ this.contract_id ?? 'NULL' }, ${ this.areValuesDepleting ?? 'NULL' }, ${ this.isActive ?? 'NULL' }, ${ identification }, ${ this.createdAt }, ${ this.order ?? 0 }${ forceId
                                                                                                                                                                                                                                           ? `, ${ this.id }`
                                                                                                                                                                                                                                           : '' }, ${ this.__v ?? 0 })`
  }

  public getUpdateStatement(): string {
    return `
UPDATE ${Meter.TABLE_NAME} 
SET 
  name = "${this.name}", 
  digits = ${this.digits}, 
  unit = "${this.unit}", 
  contract_id = ${this.contract_id ?? 'NULL'}, 
  areValuesDepleting = ${this.areValuesDepleting ?? 'NULL'}, 
  isActive = ${this.isActive ?? 'NULL'}, 
  identification = "${this.identification ?? 'NULL'}", 
  sortingOrder = ${this.order ?? 'NULL'}, 
  createdAt = ${this.createdAt} , 
  __v = ${this.__v} 
WHERE id = ${this.id}`
  }

  public getCSVValues(withChildren?: boolean): string {
    const ownHeader = [
      this.id,
      this.contract_id,
      this.name,
      this.digits,
      this.unit,
      this.areValuesDepleting,
      this.isActive,
      this.identification,
      this.createdAt,
      this.order,
      this.__v,
    ].map(e => JSON.stringify(e))
      .join(',')
    if (!withChildren) {
      return ownHeader
    }
    return `${ ownHeader }${ this.contract ? `,${ this.contract.getCSVValues() }` : '' }`
  }
}
