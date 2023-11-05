import {
  BUILDING_SELECT_ALL,
  BUILDING_TABLE_NAME,
  CONTRACT_SELECT_ALL,
  CONTRACT_TABLE_NAME,
  MEASUREMENT_SELECT_ALL,
  MEASUREMENT_TABLE_NAME,
  METER_SELECT_ALL,
  METER_TABLE_NAME,
} from '../entities'
import Measurement from '../entities/measurement'
import MeterService from './MeterService'
import { Service } from './service'

export default class MeasurementService extends Service {
  constructor(private readonly meterService = new MeterService()) {
    super(MEASUREMENT_TABLE_NAME)
  }

  getMigrationStatements(from?: number, to?: number): Array<string> {
    if (!from && to === 1) {
      return [
        ` 
CREATE TABLE IF NOT EXISTS ${MEASUREMENT_TABLE_NAME} (
    id                    INTEGER PRIMARY KEY AUTOINCREMENT,
    value                 REAL NOT NULL,
    meter_id              INTEGER NOT NULL,
    createdAt             INTEGER,
    FOREIGN KEY(meter_id) REFERENCES meter(id)
);`,
      ]
    }
    if (from === 1 && to === 2) {
      // Alter table to add __v column
      return [
        `
ALTER TABLE ${MEASUREMENT_TABLE_NAME} ADD COLUMN __v INTEGER DEFAULT 0;
`,
      ]
    }
    return []
  }

  getRetrieveAllStatement(ordered = false): string {
    return `
SELECT 
${METER_SELECT_ALL},
${MEASUREMENT_SELECT_ALL}, 
${CONTRACT_SELECT_ALL},
${BUILDING_SELECT_ALL}
FROM ${MEASUREMENT_TABLE_NAME} mm 
  INNER JOIN ${METER_TABLE_NAME} m ON mm.meter_id = m.id 
  LEFT JOIN ${CONTRACT_TABLE_NAME} c ON m.contract_id = c.id
  LEFT JOIN ${BUILDING_TABLE_NAME} b ON m.building_id = b.id
  ${ordered ? 'ORDER BY mm.createdAt DESC' : ''}`
  }

  getRetrieveByIdStatement(id: number): string {
    return `${this.getRetrieveAllStatement()} WHERE mm.id = ${id}`
  }

  getLastMeasurementForMeter(meterId: number): string {
    return `${this.getMeasurementsForMeter(meterId)} LIMIT 1`
  }

  getPreviousMeasurement(measurement: Measurement): string {
    return `${this.getRetrieveAllStatement()} WHERE m.id = ${
      measurement.meter_id
    } AND mm.createdAt < ${measurement.createdAt} ORDER BY mm.createdAt DESC LIMIT 1`
  }

  getMeasurementsForMeter(meterId: number): string {
    return `${this.getRetrieveAllStatement()} WHERE m.id = ${meterId} ORDER BY mm.createdAt DESC`
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  fromJSON(json: Record<string, any>): Measurement {
    return new Measurement(
      json.measurement_value,
      json.measurement_meter_id,
      json.measurement_createdAt,
      json.measurement_id,
      json.measurement_v,
      this.meterService.fromJSON(json)
    )
  }

  getInsertionHeader(forceId?: boolean): string {
    return `INSERT INTO ${MEASUREMENT_TABLE_NAME} (value, meter_id, createdAt${
      forceId ? ', id' : ''
    }, __v) VALUES `
  }

  public getCSVHeader(withChildren?: boolean): string {
    const ownHeader = [
      'measurement_id',
      'measurement_meter_id',
      'measurement_value',
      'measurement_createdAt',
      'measurement___v',
    ].join(',')
    if (!withChildren) {
      return ownHeader
    }
    return `${ownHeader},${this.meterService.getCSVHeader(true)}`
  }
}
