import { CONTRACT_TABLE_NAME, MEASUREMENT_TABLE_NAME, METER_TABLE_NAME } from '../entities'
import Contract from '../entities/contract'
import Meter from '../entities/meter'
import ContractService from './ContractService'
import { Service } from './service'
import moment from 'moment'

export default class MeterService extends Service {

  constructor(private readonly contractService = new ContractService()) {
    super(METER_TABLE_NAME)
  }

  getMigrationStatement(from?: number, to?: number): string {
    if (!from && to === 1) {
      return `
CREATE TABLE IF NOT EXISTS ${METER_TABLE_NAME} ( 
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

  getRetrieveAllStatement(): string {
    return `
SELECT m.*, 
c.id as contract_id, c.name as contract_name, c.pricePerUnit as contract_pricePerUnit, c.identification as contract_identification, c.createdAt as contract_createdAt,
(SELECT createdAt FROM ${MEASUREMENT_TABLE_NAME} mm_j WHERE mm_j.meter_id = m.id ORDER BY mm_j.createdAt DESC LIMIT 1) as last_measurement_date,
(SELECT value FROM ${MEASUREMENT_TABLE_NAME} mm_j WHERE mm_j.meter_id = m.id ORDER BY mm_j.createdAt DESC LIMIT 1) as last_measurement_value
FROM ${METER_TABLE_NAME} m 
    LEFT JOIN ${CONTRACT_TABLE_NAME} c ON m.contract_id = c.id
    `
  }

  getRetrieveByIdStatement(id: number): string {
    return `${this.getRetrieveAllStatement()} WHERE m.id = ${id}`
  }

  fromJSON(json: any): Meter {
    const contractJSON = Object.fromEntries(Object.entries(json)
      .filter(([key]) => key.startsWith('contract_')))
    const contract = this.contractService.fromJSON(contractJSON)

    const lastMeasurementDate = json["last_measurement_date"] ? moment(json["last_measurement_date"], "YYYY-M-D HH:mm").toDate().getTime() : undefined
    const lastMeasurementValue = json["last_measurement_value"]

    return new Meter(
      json.name, json.digits, json.unit, json.contract_id, json.areValuesIncreasing, json.isActive, json.identification,
      moment(json.createdAt, "YYYY-M-D HH:mm").toDate().getTime(), json.id, contract, lastMeasurementDate, lastMeasurementValue
    )
  }

  getInsertionHeader(): string {
    return `INSERT INTO ${METER_TABLE_NAME} (name, digits, unit, contract_id, areValuesIncreasing, isActive, identification, createdAt) VALUES `
  }
}
