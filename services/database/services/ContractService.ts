import moment from 'moment'
import { CONTRACT_TABLE_NAME } from '../entities'
import Contract from '../entities/contract'
import { Service } from './service'

export default class ContractService extends Service {

  constructor() {
    super(CONTRACT_TABLE_NAME)
  }

  getMigrationStatement(from?: number, to?: number): string {
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

  fromJSON(json: any): Contract {
    return new Contract(json.name, json.pricePerUnit, json.identification, moment(json.createdAt, 'YYYY-M-D HH:mm')
      .toDate()
      .getTime(), json.id)
  }

  getInsertionHeader(): string {
    return `INSERT INTO ${CONTRACT_TABLE_NAME} (name, pricePerUnit, identification, createdAt) VALUES `
  }
}
