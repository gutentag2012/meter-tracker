import Contract from './contract'
import Entity from './entity'

export default class Meter extends Entity {

  static TABLE_NAME = 'meter' as const

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
    private _contract?: Contract
  ) {
    super(id)
  }

  static getMigrationStatement(from?: number, to?: number): string {
    if (!from && to === 1) {
      return `
CREATE TABLE IF NOT EXISTS ${this.TABLE_NAME} ( 
  id                    INTEGER PRIMARY KEY AUTOINCREMENT, 
  name                  TEXT NOT NULL, 
  digits                INTEGER NOT NULL, 
  unit                  TEXT NOT NULL, 
  contract_id           INTEGER, 
  areValuesIncreasing   INTEGER, 
  isActive              INTEGER, 
  identification        TEXT, 
  createdAt             INTEGER, 
  FOREIGN KEY(contract_id) REFERENCES ${Contract.TABLE_NAME}(id)
);`
    }
    return ''
  }

  static getRetrieveAllStatement(): string {
    return `SELECT m.*, c.* FROM ${this.TABLE_NAME} m LEFT JOIN ${Contract.TABLE_NAME} c ON m.contract_id = c.id`
  }

  static fromJSON(json: any): Meter {
    return new Meter(
      json.name, json.digits, json.unit, json.contract_id, json.areValuesIncreasing, json.isActive, json.identification,
      json.createdAt, json.id, Contract.fromJSON(json)
    )
  }

  static getInsertionHeader(): string {
    return `INSERT INTO ${this.TABLE_NAME} (name, digits, unit, contract_id, areValuesIncreasing, isActive, identification, createdAt) VALUES `
  }

  getInsertionValues(): string {
    // TODO Think about sanitizing the values
    const identification = this.identification ? `"${ this.identification }"` : 'NULL'
    return `("${ this.name }", ${ this.digits }, "${ this.unit }", ${ this.contract_id ?? 'NULL' }, ${ this.areValuesIncreasing ?? 'NULL' }, ${ this.isActive ?? 'NULL' }, ${ identification }, ${ this.createdAt })`
  }
}
