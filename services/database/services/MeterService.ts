import { CONTRACT_TABLE_NAME, MEASUREMENT_TABLE_NAME, METER_TABLE_NAME } from '../entities'
import Contract from '../entities/contract'
import Meter from '../entities/meter'
import ContractService from './ContractService'
import { Service } from './service'

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
  areValuesDepleting    INTEGER, 
  isActive              INTEGER, 
  identification        TEXT, 
  createdAt             INTEGER, 
  sortingOrder          INTEGER,
  FOREIGN KEY(contract_id) REFERENCES ${Contract.TABLE_NAME}(id)
);`
    }
    if (from === 1 && to === 2) {
      // Alter table to add __v column
      return `
ALTER TABLE ${METER_TABLE_NAME} ADD COLUMN __v INTEGER DEFAULT 0;
`
    }
    return ''
  }

  getRetrieveAllStatement(ordered = false): string {
    return `
SELECT 
m.name as meter_name, m.digits as meter_digits, m.unit as meter_unit, m.contract_id as meter_contract_id, m.areValuesDepleting as meter_areValuesDepleting, m.isActive as meter_isActive, m.identification as meter_identification, m.createdAt as meter_createdAt, m.sortingOrder as meter_order, m.id as meter_id, m.__v as meter_v,
c.id as contract_id, c.name as contract_name, c.pricePerUnit as contract_pricePerUnit, c.identification as contract_identification, c.createdAt as contract_createdAt,
(SELECT createdAt FROM ${MEASUREMENT_TABLE_NAME} mm_j WHERE mm_j.meter_id = m.id ORDER BY mm_j.createdAt DESC LIMIT 1) as last_measurement_date,
(SELECT value FROM ${MEASUREMENT_TABLE_NAME} mm_j WHERE mm_j.meter_id = m.id ORDER BY mm_j.createdAt DESC LIMIT 1) as last_measurement_value
FROM ${METER_TABLE_NAME} m 
    LEFT JOIN ${CONTRACT_TABLE_NAME} c ON m.contract_id = c.id
    ${ ordered ? 'ORDER BY COALESCE(m.sortingOrder, m.name) ASC, m.name ASC' : '' }
    `
  }

  getRetrieveByIdStatement(id: number): string {
    return `${ this.getRetrieveAllStatement() } WHERE m.id = ${ id }`
  }

  fromJSON(json: any): Meter {
    const contract = this.contractService.fromJSON(json)

    const lastMeasurementDate = json['last_measurement_date'] ? json['last_measurement_date'] : undefined
    const lastMeasurementValue = json['last_measurement_value']

    return new Meter(
      json.meter_name, json.meter_digits, json.meter_unit, json.meter_contract_id, json.meter_areValuesDepleting,
      json.meter_isActive, json.meter_identification,
      json.meter_createdAt, json.meter_order, json.meter_id, json.meter_v, contract, lastMeasurementDate,
      lastMeasurementValue,
    )
  }

  getInsertionHeader(forceId?: boolean): string {
    return `INSERT INTO ${METER_TABLE_NAME} (name, digits, unit, contract_id, areValuesDepleting, isActive, identification, createdAt, sortingOrder${forceId ? ', id': ''}, __v) VALUES `
  }

  public getCSVHeader(withChildren?: boolean): string {
    const ownHeader = [
      'meter_id',
      'meter_contract_id',
      'meter_name',
      'meter_digits',
      'meter_unit',
      'meter_areValuesDepleting',
      'meter_isActive',
      'meter_identification',
      'meter_createdAt',
      'meter_order',
      'meter___v',
    ].join(',')
    if (!withChildren) {
      return ownHeader
    }
    return `${ ownHeader },${ this.contractService.getCSVHeader(true) }`
  }
}
