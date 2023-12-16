import { type MetersEntity } from '@/meters/meters.entity'

import { tableSelector } from '@utils/TableSelector'

export type DetailedMeter = {
  id: number
  name: string
  digits: number
  unit: string
  contract_id?: number
  areValuesDepleting?: boolean
  isActive?: boolean
  identification?: string
  createdAt?: number
  sortingOrder?: number
  isRefillable?: boolean
  building_id?: number
}

export type DetailedMeterWithLastValue = DetailedMeter & {
  lastMeasurementValue?: number | null
}

export type DetailedMeterWithValueSummary = DetailedMeterWithLastValue & {
  lastMeasurementDate: number | null

  difference: number | null
  daysBetween: number | null

  prevDifference: number | null
  prevDaysBetween: number | null
}

const meterSelector = {
  id: '',
  name: '',
  digits: '',
  unit: '',
  contract_id: '',
  areValuesDepleting: '',
  isActive: '',
  identification: '',
  createdAt: '',
  sortingOrder: '',
  isRefillable: '',
  building_id: '',
}

export const detailedMeterSelectWithPrefix = tableSelector<MetersEntity>(meterSelector, 'meter')
const detailedMeterSelect = tableSelector<MetersEntity>(meterSelector, 'meter', '')

const MILLIS_PER_DAY = 1_000 * 60 * 60 * 24

export const DetailedMeterForBuildingSelector = `
    SELECT ${detailedMeterSelect},
           (SELECT measurement.value from measurement WHERE measurement.meter_id = meter.id ORDER BY measurement.createdAt DESC LIMIT 1) as lastMeasurementValue,
           (SELECT measurement.createdAt from measurement WHERE measurement.meter_id = meter.id ORDER BY measurement.createdAt DESC LIMIT 1) as lastMeasurementDate,
           (SELECT measurement.value - LAG(measurement.value) OVER (ORDER BY measurement.createdAt) from measurement WHERE measurement.meter_id = meter.id ORDER BY measurement.createdAt DESC LIMIT 1) as difference,
           (SELECT (measurement.createdAt - LAG(measurement.createdAt) OVER (ORDER BY measurement.createdAt)) / ${MILLIS_PER_DAY} from measurement WHERE measurement.meter_id = meter.id ORDER BY measurement.createdAt DESC LIMIT 1) as daysBetween,
           (SELECT LAG(measurement.value) OVER (ORDER BY measurement.createdAt) - LAG(measurement.value, 2) OVER (ORDER BY measurement.createdAt) from measurement WHERE measurement.meter_id = meter.id ORDER BY measurement.createdAt DESC LIMIT 1) as prevDifference,
           (SELECT (LAG(measurement.createdAt) OVER (ORDER BY measurement.createdAt) - LAG(measurement.createdAt, 2) OVER (ORDER BY measurement.createdAt)) / ${MILLIS_PER_DAY} from measurement WHERE measurement.meter_id = meter.id ORDER BY measurement.createdAt DESC LIMIT 1) as prevDaysBetween
    FROM meter
    WHERE meter.building_id = ?
`

export const DetailedMetersSelector = `
    SELECT ${detailedMeterSelect},
           (SELECT measurement.value from measurement WHERE measurement.meter_id = meter.id ORDER BY measurement.createdAt DESC LIMIT 1) as lastMeasurementValue
    FROM meter
`

export const DetailedMeterByIdSelector = `
    SELECT ${detailedMeterSelect}
    FROM meter
    WHERE meter.id = ?
`
