import { BUILDING_SELECT_ALL, BUILDING_TABLE_NAME } from '../entities'
import { Service } from './service'
import Building, { DEFAULT_BUILDING_ID } from '../entities/building'

export default class BuildingService extends Service {
  constructor() {
    super(BUILDING_TABLE_NAME)
  }

  getMigrationStatements(from?: number, to?: number): Array<string> {
    if (from === 4 && to === 5) {
      return [
        `
      CREATE TABLE IF NOT EXISTS ${BUILDING_TABLE_NAME} (
        id                    INTEGER PRIMARY KEY AUTOINCREMENT,
        name                  TEXT NOT NULL,
        address               TEXT,
        notes                 TEXT,
        createdAt             INTEGER,
        __v                   INTEGER
      );`,
        `INSERT OR IGNORE INTO ${BUILDING_TABLE_NAME} (id, name, createdAt) VALUES (${DEFAULT_BUILDING_ID}, "default", ${Date.now()});`,
      ]
    }
    return []
  }

  getDeleteAllStatement(): string {
    return `DELETE FROM ${BUILDING_TABLE_NAME} WHERE id != ${DEFAULT_BUILDING_ID}`
  }

  getDeleteStatement(id: number): string {
    if (id === DEFAULT_BUILDING_ID) {
      return ''
    }
    return super.getDeleteStatement(id)
  }

  getRetrieveAllStatement(ordered = false): string {
    return `
        SELECT
            ${BUILDING_SELECT_ALL}
        FROM ${BUILDING_TABLE_NAME} b
            ${ordered ? 'ORDER BY b.id ASC' : ''}
    `
  }

  getRetrieveByIdStatement(id: number): string {
    return `${this.getRetrieveAllStatement()} WHERE b.id = ${id}`
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  fromJSON(json: Record<string, any>): Building {
    return new Building(
      json.building_name,
      json.building_address,
      json.building_notes,
      json.building_createdAt,
      json.building_id,
      json.building_v
    )
  }

  getInsertionHeader(forceId?: boolean): string {
    return `INSERT INTO ${BUILDING_TABLE_NAME} (name, address, notes, createdAt${
      forceId ? ', id' : ''
    }, __v) VALUES `
  }

  public getCSVHeader(withChildren?: boolean): string {
    const ownHeader = [
      'building_id',
      'building_name',
      'building_address',
      'building_notes',
      'building_createdAt',
      'building___v',
    ].join(',')
    if (!withChildren) {
      return ownHeader
    }
    return ownHeader
  }
}
