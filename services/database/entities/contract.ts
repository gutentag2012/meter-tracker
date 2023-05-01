import moment from 'moment'
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
  ) {
    super(id)
  }

  getInsertionValues(): string {
    // TODO Think about sanitizing the values
    const identification = this.identification ? `"${ this.identification }"` : 'NULL'
    return `("${ this.name }", ${ this.pricePerUnit }, ${ identification }, "${ moment(this.createdAt)
      .format('YYYY-MM-DD HH:mm') }")`
  }

  public getUpdateStatement(): string {
    return `
UPDATE ${ Contract.TABLE_NAME } 
SET 
  name = "${ this.name }", 
  pricePerUnit = ${ this.pricePerUnit }, 
  identification = "${ this.identification ?? 'NULL' }", 
  createdAt = "${ moment( this.createdAt ).format( 'YYYY-MM-DD HH:mm' ) }" 
WHERE id = ${ this.id }`
  }
}
