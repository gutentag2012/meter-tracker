import { CONTRACT_TABLE_NAME, MEASUREMENT_TABLE_NAME, METER_TABLE_NAME } from '../entities'
import Measurement from '../entities/measurement'
import MeterService from './MeterService'
import { Service } from './service'

export default class MeasurementService extends Service {

  constructor(private readonly meterService = new MeterService()) {
    super(MEASUREMENT_TABLE_NAME)
  }

  getMigrationStatement(from?: number, to?: number): string {
    if (!from && to === 1) {
      return ` 
CREATE TABLE IF NOT EXISTS ${MEASUREMENT_TABLE_NAME} (
    id                    INTEGER PRIMARY KEY AUTOINCREMENT,
    value                 REAL NOT NULL,
    meter_id              INTEGER NOT NULL,
    createdAt             INTEGER,
    FOREIGN KEY(meter_id) REFERENCES meter(id)
);`
    }
    if (from === 1 && to === 2) {
      // Alter table to add __v column
      return `
ALTER TABLE ${MEASUREMENT_TABLE_NAME} ADD COLUMN __v INTEGER DEFAULT 0;
`
    }
    return ''
  }

  getRetrieveAllStatement(ordered = false): string {
    return `
SELECT 
m.name as meter_name, m.digits as meter_digits, m.unit as meter_unit, m.contract_id as meter_contract_id, m.areValuesDepleting as meter_areValuesDepleting, m.isRefillable as meter_isRefillable, m.isActive as meter_isActive, m.identification as meter_identification, m.createdAt as meter_createdAt, m.id as meter_id,
mm.value as measurement_value, mm.meter_id as measurement_meter_id, mm.createdAt as measurement_createdAt, mm.id as measurement_id, mm.__v as measurement_v, 
c.id as contract_id, c.name as contract_name, c.pricePerUnit as contract_pricePerUnit, c.identification as contract_identification, c.createdAt as contract_createdAt 
FROM ${MEASUREMENT_TABLE_NAME} mm 
  INNER JOIN ${METER_TABLE_NAME} m ON mm.meter_id = m.id 
  LEFT JOIN ${CONTRACT_TABLE_NAME} c ON m.contract_id = c.id
  ${ordered ? 'ORDER BY mm.createdAt DESC' : ''}`
  }

  getRetrieveByIdStatement(id: number): string {
    return `${ this.getRetrieveAllStatement() } WHERE mm.id = ${ id }`
  }

  getLastMeasurementForMeter(meterId: number): string {
    return `${ this.getMeasurementsForMeter(meterId) } LIMIT 1`
  }

  getPreviousMeasurement(measurement: Measurement): string {
    return `${ this.getRetrieveAllStatement() } WHERE m.id = ${ measurement.meter_id } AND mm.createdAt < ${ measurement.createdAt } ORDER BY mm.createdAt DESC LIMIT 1`
  }

  getMeasurementsForMeter(meterId: number): string {
    return `${ this.getRetrieveAllStatement() } WHERE m.id = ${ meterId } ORDER BY mm.createdAt DESC`
  }

  fromJSON(json: any): Measurement {
    return new Measurement(
      json.measurement_value, json.measurement_meter_id,
      json.measurement_createdAt, json.measurement_id, json.measurement_v, this.meterService.fromJSON(json),
    )
  }

  getInsertionHeader(forceId?: boolean): string {
    return `INSERT INTO ${MEASUREMENT_TABLE_NAME} (value, meter_id, createdAt${forceId ? ', id': ''}, __v) VALUES `
  }

  public getCSVHeader(withChildren?: boolean): string {
    const ownHeader = [
      'measurement_id', 'measurement_meter_id', 'measurement_value', 'measurement_createdAt', 'measurement___v',
    ].join(',')
    if (!withChildren) {
      return ownHeader
    }
    return `${ ownHeader },${ this.meterService.getCSVHeader(true) }`
  }
}
