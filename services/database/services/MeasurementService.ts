import moment from 'moment/moment'
import { MEASUREMENT_TABLE_NAME, METER_TABLE_NAME } from '../entities'
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
    return `SELECT m.*, mm.* FROM ${MEASUREMENT_TABLE_NAME} mm INNER JOIN ${METER_TABLE_NAME} m ON mm.meter_id = m.id`
  }

  getRetrieveByIdStatement(id: number): string {
    return `${ this.getRetrieveAllStatement() } WHERE mm.id = ${ id }`
  }

  getLastMeasurementForMeter(meterId: number): string {
    return `${ this.getRetrieveAllStatement() } WHERE m.id = ${ meterId } ORDER BY mm.createdAt DESC LIMIT 1`
  }

  fromJSON(json: any): Measurement {
    return new Measurement(json.value, json.meter_id, moment(json.createdAt, 'YYYY-M-D HH:mm')
      .toDate()
      .getTime(), json.id, this.meterService.fromJSON(json))
  }

  getInsertionHeader(): string {
    return `INSERT INTO ${MEASUREMENT_TABLE_NAME} (value, meter_id, createdAt) VALUES `
  }
}
