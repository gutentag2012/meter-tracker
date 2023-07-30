import moment from 'moment'
import { CONTRACT_TABLE_NAME, MEASUREMENT_TABLE_NAME, METER_TABLE_NAME } from '../entities'
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
    createdAt             INTEGER
);`
    }
    return ''
  }

  public getRetrieveAllStatement(ordered=false): string {
    const startOfThisMonth = moment().startOf('month').valueOf()
    const startOfLastMonth = moment().subtract(1, 'month').startOf('month').valueOf()
    const endOfLastMonth = moment(startOfLastMonth).endOf('month').valueOf()
    return `
SELECT 
  c.name as contract_name,
  c.pricePerUnit as contract_pricePerUnit,
  c.identification as contract_identification,
  c.createdAt as contract_createdAt,
  c.id as contract_id,
  (SELECT mm.value FROM ${METER_TABLE_NAME} m LEFT JOIN ${MEASUREMENT_TABLE_NAME} mm ON (m.id = mm.meter_id AND mm.createdAt >= ${startOfLastMonth} AND mm.createdAt <= ${endOfLastMonth}) WHERE m.contract_id = c.id ORDER BY mm.createdAt ASC LIMIT 1) as contract_lastMonthFirstReading,
  (SELECT mm.value FROM ${METER_TABLE_NAME} m LEFT JOIN ${MEASUREMENT_TABLE_NAME} mm ON (m.id = mm.meter_id AND mm.createdAt >= ${startOfLastMonth} AND mm.createdAt <= ${endOfLastMonth}) WHERE m.contract_id = c.id ORDER BY mm.createdAt DESC LIMIT 1) as contract_lastMonthLastReading,
  (SELECT mm.value FROM ${METER_TABLE_NAME} m LEFT JOIN ${MEASUREMENT_TABLE_NAME} mm ON (m.id = mm.meter_id AND mm.createdAt >= ${startOfThisMonth}) WHERE m.contract_id = c.id ORDER BY mm.createdAt DESC LIMIT 1) as contract_thisMonthLastReading
FROM ${ this.TableName } c
${ ordered ? 'ORDER BY c.name ASC' : ''}`
  }

  fromJSON(json: any): Contract {
    const lastMonthConsumption = (json.contract_lastMonthLastReading ?? 0) - (json.contract_lastMonthFirstReading ?? 0)
    const thisMonthConsumption = (json.contract_thisMonthLastReading ?? 0) - (json.contract_lastMonthLastReading ?? 0)
    return new Contract(
      json.contract_name, json.contract_pricePerUnit, json.contract_identification,
      json.contract_createdAt, json.contract_id, lastMonthConsumption, thisMonthConsumption
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
