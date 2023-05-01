import moment from 'moment/moment'
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
    createdAt             STRING,
    FOREIGN KEY(meter_id) REFERENCES meter(id)
);`
    }
    return ''
  }

  getRetrieveAllStatement(): string {
    return `
SELECT 
m.*, 
mm.value as measurement_value, 
mm.meter_id as measurement_meter_id, 
mm.createdAt as measurement_createdAt, 
mm.id as measurement_id, 
c.id as contract_id, c.name as contract_name, c.pricePerUnit as contract_pricePerUnit, c.identification as contract_identification, c.createdAt as contract_createdAt 
FROM ${MEASUREMENT_TABLE_NAME} mm 
  INNER JOIN ${METER_TABLE_NAME} m ON mm.meter_id = m.id 
  LEFT JOIN ${CONTRACT_TABLE_NAME} c ON m.contract_id = c.id`
  }

  getRetrieveByIdStatement(id: number): string {
    return `${ this.getRetrieveAllStatement() } WHERE mm.id = ${ id }`
  }

  getLastMeasurementForMeter(meterId: number): string {
    return `${ this.getMeasurementsForMeter(meterId) } LIMIT 1`
  }

  getMeasurementsForMeter(meterId: number): string {
    return `${ this.getRetrieveAllStatement() } WHERE m.id = ${ meterId } ORDER BY mm.createdAt DESC`
  }

  fromJSON(json: any): Measurement {
    return new Measurement(json.measurement_value, json.measurement_meter_id, moment(json.measurement_createdAt, 'YYYY-M-D HH:mm')
      .toDate()
      .getTime(), json.measurement_id, this.meterService.fromJSON(json))
  }

  getInsertionHeader(): string {
    return `INSERT INTO ${MEASUREMENT_TABLE_NAME} (value, meter_id, createdAt) VALUES `
  }
}
