import moment from 'moment'
import Entity from './entity'
import { CONTRACT_TABLE_NAME, MEASUREMENT_TABLE_NAME, METER_TABLE_NAME } from './index'

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

  static getMigrationStatement(from?: number, to?: number): string {
    if (!from && to === 1) {
      return `
CREATE TABLE IF NOT EXISTS ${CONTRACT_TABLE_NAME} (
    id                    INTEGER PRIMARY KEY AUTOINCREMENT,
    name                  TEXT NOT NULL,
    pricePerUnit          REAL NOT NULL,
    identification        TEXT,
    createdAt             STRING
);`
    }
    return ''
  }

  static fromJSON(json: any): Contract {
    return new Contract(json.name, json.pricePerUnit, json.identification, moment(json.createdAt, "YYYY-M-D HH:mm").toDate().getTime(), json.id)
  }

  static getInsertionHeader(): string {
    return `INSERT INTO ${CONTRACT_TABLE_NAME} (name, pricePerUnit, identification, createdAt) VALUES `
  }

  getInsertionValues(): string {
    // TODO Think about sanitizing the values
    const identification = this.identification ? `"${ this.identification }"` : 'NULL'
    return `("${ this.name }", ${ this.pricePerUnit }, ${ identification }, "${ moment(this.createdAt).format("YYYY-MM-DD HH:mm") }")`
  }
}
