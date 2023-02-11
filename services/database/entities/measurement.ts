import moment from 'moment/moment'
import Entity from './entity'
import { MEASUREMENT_TABLE_NAME, METER_TABLE_NAME } from './index'
import Meter from './meter'

export default class Measurement extends Entity {

  static TABLE_NAME = MEASUREMENT_TABLE_NAME

  constructor(
    public value: number,
    public meter_id: number,
    public createdAt: number = Date.now(),
    public id?: number,
    private _meter?: Meter,
  ) {
    super(id)
  }

  static getMigrationStatement(from?: number, to?: number): string {
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

  static getRetrieveAllStatement(): string {
    return `SELECT m.*, mm.* FROM ${MEASUREMENT_TABLE_NAME} mm INNER JOIN ${METER_TABLE_NAME} m ON mm.meter_id = m.id`
  }

  static fromJSON(json: any): Measurement {
    return new Measurement(json.value, json.meter_id, moment(json.createdAt, "YYYY-M-D HH:mm").toDate().getTime(), json.id, Meter.fromJSON(json))
  }

  static getInsertionHeader(): string {
    return `INSERT INTO ${MEASUREMENT_TABLE_NAME} (value, meter_id, createdAt) VALUES `
  }

  getInsertionValues(): string {
    // TODO Think about sanitizing the values
    return `(${ this.value }, ${ this.meter_id }, "${ moment(this.createdAt).format("YYYY-MM-DD HH:mm") }")`
  }
}
