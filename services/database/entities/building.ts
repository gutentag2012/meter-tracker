import Entity from './entity'
import { BUILDING_TABLE_NAME } from './index'

export const DEFAULT_BUILDING_ID = 1

export default class Building extends Entity {
  static TABLE_NAME = BUILDING_TABLE_NAME

  constructor(
    public name: string,
    public address?: string,
    public notes?: string,
    public createdAt: number = Date.now(),
    public id?: number,
    public __v = 0
  ) {
    super(id)
  }

  getInsertionValues(forceId?: boolean): string {
    const address = this.address ? `"${this.address}"` : 'NULL'
    const notes = this.notes ? `"${this.notes}"` : 'NULL'
    return `("${this.name}", ${address}, ${notes}, ${this.createdAt}${
      forceId ? `, ${this.id}` : ''
    }, ${this.__v ?? 0})`
  }

  public getUpdateStatement(): string {
    return `
UPDATE ${Building.TABLE_NAME} 
SET 
  name = "${this.name}", 
  address = ${this.address ? `"${this.address}"` : 'NULL'}, 
  notes = ${this.notes ? `"${this.notes}"` : 'NULL'}, 
  createdAt = ${this.createdAt}, 
  __v = ${this.__v}
WHERE id = ${this.id}`
  }

  public getCSVValues(): string {
    return [this.id, this.name, this.address, this.notes, this.createdAt, this.__v]
      .map((e) => JSON.stringify(e))
      .join(',')
  }
}
