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
    if (from === 1 && to === 2) {
      // Alter table to add __v column
        return `
ALTER TABLE ${CONTRACT_TABLE_NAME} ADD COLUMN __v INTEGER DEFAULT 0;
`
    }
    if (from === 2 && to === 3) {
      // Alter table to add conversion column
        return `
ALTER TABLE ${CONTRACT_TABLE_NAME} ADD COLUMN conversion REAL DEFAULT 1;
`
    }
    return ''
  }

  public getRetrieveAllStatement(ordered = false): string {
    const startOfThisMonth = moment().startOf('month').valueOf()
    const endOfThisMonth = moment().endOf('month').valueOf()
    const startOfLastMonth = moment().subtract(1, 'month').startOf('month').valueOf()

    return `
SELECT 
  c.name as contract_name,
  c.pricePerUnit as contract_pricePerUnit,
  c.identification as contract_identification,
  c.createdAt as contract_createdAt,
  c.conversion as contract_conversion,
  c.id as contract_id,
  c.__v as contract_v,
  (
    SELECT mm.value || '|' || mm.createdAt 
        FROM ${METER_TABLE_NAME} m LEFT JOIN ${MEASUREMENT_TABLE_NAME} mm ON (m.id = mm.meter_id AND mm.createdAt <= ${endOfThisMonth} AND mm.createdAt >= ${startOfThisMonth}) 
        WHERE m.contract_id = c.id 
        ORDER BY mm.createdAt DESC
        LIMIT 1
  ) as this_month_anchor,
  (
    SELECT mm.value || '|' || mm.createdAt 
        FROM ${METER_TABLE_NAME} m LEFT JOIN ${MEASUREMENT_TABLE_NAME} mm ON (m.id = mm.meter_id AND mm.createdAt <= ${startOfThisMonth} AND mm.createdAt >= ${startOfLastMonth}) 
        WHERE m.contract_id = c.id 
        ORDER BY mm.createdAt DESC
        LIMIT 1
  ) as last_month_anchor,
  (
    SELECT mm.value || '|' || mm.createdAt 
        FROM ${METER_TABLE_NAME} m LEFT JOIN ${MEASUREMENT_TABLE_NAME} mm ON (m.id = mm.meter_id AND mm.createdAt <= ${startOfLastMonth}) 
        WHERE m.contract_id = c.id 
        ORDER BY mm.createdAt DESC
        LIMIT 1
  ) as last_last_month_anchor
FROM ${ this.TableName } c
${ ordered ? 'ORDER BY c.name ASC' : ''}`
  }

  fromJSON(json: any): Contract {
    const daysIntoMonth = moment().date()
    const daysOfLastMonth = moment().subtract(1, 'month').daysInMonth()

    const mapAnchors = (row?: [string, string]) => row ? ({
      value: parseFloat(row[0]),
      date: parseInt(row[1]),
    }) : undefined

    const thisMonthAnchor = mapAnchors(json.this_month_anchor?.split('|'))
    const lastMonthAnchor = mapAnchors(json.last_month_anchor?.split('|'))
    const lastLastMonthAnchor = mapAnchors(json.last_last_month_anchor?.split('|'))

    let thisMonthConsumption = 0
    if(thisMonthAnchor && (lastMonthAnchor || lastLastMonthAnchor)) {
      const compareEntity = (lastMonthAnchor || lastLastMonthAnchor)!
      const daysBetween = moment(thisMonthAnchor.date).endOf("day").diff(moment(compareEntity.date).startOf("day"), 'days')
      const consumptionPerDay = (thisMonthAnchor.value - compareEntity.value) / daysBetween
      thisMonthConsumption = consumptionPerDay * daysIntoMonth
    }

    let lastMonthConsumption = 0
    if((lastMonthAnchor || thisMonthAnchor) && lastLastMonthAnchor) {
      const compareEntity = (lastMonthAnchor || thisMonthAnchor)!
      const daysBetween = moment(compareEntity.date).endOf("day").diff(moment(lastLastMonthAnchor.date).startOf("day"), 'days')
      const consumptionPerDay = (compareEntity.value - lastLastMonthAnchor.value) / daysBetween
      lastMonthConsumption = consumptionPerDay * daysOfLastMonth
    }

    return new Contract(
      json.contract_name, json.contract_pricePerUnit, json.contract_identification,
      json.contract_createdAt, json.contract_conversion, json.contract_id, json.contract_v, lastMonthConsumption, thisMonthConsumption,
    )
  }

  getInsertionHeader(forceId?: boolean): string {
    return `INSERT INTO ${ CONTRACT_TABLE_NAME } (name, pricePerUnit, identification, createdAt, conversion${ forceId
                                                                                                  ? ', id'
                                                                                                  : '' }, __v)
            VALUES `
  }

  public getCSVHeader(): string {
    return [
      'contract_id',
      'contract_name',
      'contract_pricePerUnit',
      'contract_identification',
      'contract_createdAt',
      'contract_conversion',
      'contract___v',
    ].join(',')
  }
}
