import Entity from './entity'
import { CONTRACT_TABLE_NAME } from './index'

export default class Contract extends Entity {

  static TABLE_NAME = CONTRACT_TABLE_NAME

  constructor(
    public name: string,
    public pricePerUnit: number,
    public identification?: string,
    public createdAt: number = Date.now(),
    public id?: number,
    public __v = 0,
    public lastMonthConsumption?: number,
    public thisMonthConsumption?: number,
  ) {
    super(id)
  }

  getInsertionValues(forceId?: boolean): string {
    const identification = this.identification ? `"${ this.identification }"` : 'NULL'
    return `("${ this.name }", ${ this.pricePerUnit }, ${ identification }, ${ this.createdAt }${ forceId
                                                                                                  ? `, ${ this.id }`
                                                                                                  : '' }, ${ this.__v ?? 0 })`
  }

  public getUpdateStatement(): string {
    return `
UPDATE ${ Contract.TABLE_NAME } 
SET 
  name = "${ this.name }", 
  pricePerUnit = ${ this.pricePerUnit }, 
  identification = "${ this.identification ?? 'NULL' }", 
  createdAt = ${ this.createdAt }, 
  __v = ${ this.__v }
WHERE id = ${ this.id }`
  }

  public getCSVValues(): string {
    return [
      this.id,
      this.name,
      this.pricePerUnit,
      this.identification,
      this.createdAt,
      this.__v,
    ].map(e => JSON.stringify(e))
      .join(',')
  }
}
