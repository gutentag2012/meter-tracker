import { type ContractsEntity } from '@/contracts/contracts.entity'
import { type MeasurementsEntity } from '@/measurements/measurements.entity'
import { type DetailedMeter, detailedMeterSelectWithPrefix } from '@/meters/meters.selector'

import { tableSelector } from '@utils/TableSelector'

export type DetailedMeasurement = {
  id: number
  value: number
  createdAt: number
  meter_id: number
  __v: number
}

export type ReducedMeasurement = {
  id: number
  value: number
  createdAt: number
}

export type DetailedMeasurementWithSummaryAndContract = ReducedMeasurement & {
  prevValue: number | null
  difference: number | null
  daysBetween: number | null

  prevDifference: number | null
  prevDaysBetween: number | null

  meter: DetailedMeter & {
    contract?: {
      pricePerUnit: number
    }
  }
}

const detailedMeterContractSelect = tableSelector<ContractsEntity>(
  {
    pricePerUnit: '',
  },
  'contract',
  'meter.contract'
)

const detailedMeasurementSelect = tableSelector<MeasurementsEntity>(
  {
    id: '',
    value: '',
    createdAt: '',
    meter_id: '',
    __v: '',
  },
  ''
)

const MILLIS_PER_DAY = 1_000 * 60 * 60 * 24

export const DetailedMeasurementSelector = `
          SELECT measurement.id,
                 measurement.value,
                 LAG(measurement.value) OVER (ORDER BY measurement.createdAt) as prevValue,
                 measurement.createdAt,
                 measurement.value - LAG(measurement.value) OVER (ORDER BY measurement.createdAt) AS difference, 
                  (measurement.createdAt - LAG(measurement.createdAt) OVER (ORDER BY measurement.createdAt)) / ${MILLIS_PER_DAY} AS daysBetween,
                 LAG(measurement.value) OVER (ORDER BY measurement.createdAt) - LAG(measurement.value, 2) OVER (ORDER BY measurement.createdAt) AS prevDifference, 
                  (LAG(measurement.createdAt) OVER (ORDER BY measurement.createdAt) - LAG(measurement.createdAt, 2) OVER (ORDER BY measurement.createdAt)) / ${MILLIS_PER_DAY} AS prevDaysBetween,
                 ${detailedMeterSelectWithPrefix},
                 ${detailedMeterContractSelect}
          FROM measurement 
              LEFT JOIN meter ON measurement.meter_id = meter.id
              LEFT JOIN contract ON meter.contract_id = contract.id
          WHERE measurement.meter_id = ?
      `

export const DetailedMeasurementByIdSelector = `
          SELECT ${detailedMeasurementSelect}
          FROM measurement
          WHERE measurement.id = ?
      `
