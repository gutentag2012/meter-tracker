import {
  BUILDING_SELECT_ALL,
  BUILDING_TABLE_NAME,
  CONTRACT_SELECT_ALL,
  CONTRACT_TABLE_NAME,
  MEASUREMENT_TABLE_NAME,
  METER_SELECT_ALL,
  METER_TABLE_NAME,
} from '../entities'
import Contract from '../entities/contract'
import Meter from '../entities/meter'
import ContractService from './ContractService'
import { Service } from './service'
import BuildingService from './BuildingService'
import { DEFAULT_BUILDING_ID } from '../entities/building'

export default class MeterService extends Service {
  constructor(
    private readonly contractService = new ContractService(),
    private readonly buildingService = new BuildingService()
  ) {
    super(METER_TABLE_NAME)
  }

  getMigrationStatements(from?: number, to?: number): Array<string> {
    if (!from && to === 1) {
      return [
        `
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
);`,
      ]
    }
    if (from === 1 && to === 2) {
      return [
        `
ALTER TABLE ${METER_TABLE_NAME} ADD COLUMN __v INTEGER DEFAULT 0;
`,
      ]
    }
    if (from === 3 && to === 4) {
      return [
        `
ALTER TABLE ${METER_TABLE_NAME} ADD COLUMN isRefillable INTEGER DEFAULT 0;
`,
      ]
    }
    if (from === 4 && to === 5) {
      return [
        `
ALTER TABLE ${METER_TABLE_NAME} ADD COLUMN building_id INTEGER DEFAULT ${DEFAULT_BUILDING_ID} REFERENCES ${BUILDING_TABLE_NAME}(id) ON DELETE SET DEFAULT;
`,
        `
        UPDATE ${METER_TABLE_NAME} SET building_id = ${DEFAULT_BUILDING_ID} WHERE building_id IS NULL;
        `,
      ]
    }
    return []
  }

  getRetrieveAllStatement(ordered = false): string {
    return `
        SELECT
            ${METER_SELECT_ALL},
            ${CONTRACT_SELECT_ALL},
            ${BUILDING_SELECT_ALL},
            (SELECT GROUP_CONCAT(measurements.row, ';') FROM (SELECT mm.value || '|' || mm.createdAt as row FROM ${MEASUREMENT_TABLE_NAME} mm WHERE mm.meter_id = m.id ORDER BY mm.createdAt DESC LIMIT 3) measurements) as last_measurements
        FROM ${METER_TABLE_NAME} m
                 LEFT JOIN ${CONTRACT_TABLE_NAME} c ON m.contract_id = c.id
                 LEFT JOIN ${BUILDING_TABLE_NAME} b ON m.building_id = b.id
            ${ordered ? 'ORDER BY COALESCE(m.sortingOrder, m.name) ASC, m.name ASC' : ''}
    `
  }

  getRetrieveByIdStatement(id: number): string {
    return `${this.getRetrieveAllStatement()} WHERE m.id = ${id}`
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  fromJSON(json: Record<string, any>): Meter {
    const contract = this.contractService.fromJSON(json)
    const building = this.buildingService.fromJSON(json)

    const lastMeasurements = json['last_measurements']?.split(';').map((row: string) => {
      const [value, date] = row.split('|')
      return {
        value: parseFloat(value),
        date: parseInt(date),
      }
    })

    return new Meter(
      json.meter_name,
      json.meter_digits,
      json.meter_unit,
      json.meter_contract_id,
      json.meter_building_id,
      json.meter_areValuesDepleting,
      json.meter_isRefillable,
      json.meter_isActive,
      json.meter_identification,
      json.meter_createdAt,
      json.meter_order,
      json.meter_id,
      json.meter_v,
      contract,
      building,
      lastMeasurements
    )
  }

  getInsertionHeader(forceId?: boolean): string {
    return `INSERT INTO ${METER_TABLE_NAME} (name, digits, unit, contract_id, building_id, areValuesDepleting, isRefillable, isActive, identification, createdAt, sortingOrder${
      forceId ? ', id' : ''
    }, __v) VALUES `
  }

  getMetersForBuildingStatement(buildingId: number): string {
    return `${this.getRetrieveAllStatement()} WHERE m.building_id = ${buildingId} ORDER BY COALESCE(m.sortingOrder, m.name) ASC, m.name ASC`
  }

  public getCSVHeader(withChildren?: boolean): string {
    const ownHeader = [
      'meter_id',
      'meter_contract_id',
      'meter_name',
      'meter_digits',
      'meter_unit',
      'meter_areValuesDepleting',
      'meter_isRefillable',
      'meter_isActive',
      'meter_identification',
      'meter_createdAt',
      'meter_order',
      'meter___v',
      'meter_building_id',
    ].join(',')
    if (!withChildren) {
      return ownHeader
    }
    const contractCSVHeader = this.contractService.getCSVHeader()
    const buildingCSVHeader = this.buildingService.getCSVHeader(withChildren)
    return `${ownHeader},${contractCSVHeader},${buildingCSVHeader}`
  }
}
