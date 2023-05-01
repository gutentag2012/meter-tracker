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

  public getRetrieveAllStatement(): string {
    return `
SELECT 
  name as contract_name,
  pricePerUnit as contract_pricePerUnit,
  identification as contract_identification,
  createdAt as contract_createdAt,
  id as contract_id 
FROM ${ this.TableName }`
  }

  fromJSON(json: any): Contract {
    return new Contract(
      json.contract_name, json.contract_pricePerUnit, json.contract_identification,
      typeof json.contract_createdAt === 'number' ? json.contract_createdAt : moment(
        json.contract_createdAt,
        'YYYY-M-D HH:mm',
      )
        .toDate()
        .getTime(), json.contract_id,
    )
  }

  getInsertionHeader(forceId?: boolean): string {
    return `INSERT INTO ${CONTRACT_TABLE_NAME} (name, pricePerUnit, identification, createdAt${forceId ? ", id": ""}) VALUES `
  }

  public getCSVHeader(withChildren?: boolean): string {
    return [
      'contract_id',
      'contract_name',
      'contract_pricePerUnit',
      'contract_identification',
      'contract_createdAt',
    ].join(',')
  }
}
