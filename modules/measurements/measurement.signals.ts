import EventEmitter from '@/events'
import { EVENT_INVALIDATE_MEASUREMENTS } from '@/measurements/measurements.constants'
import { selectedMeterSignal } from '@/meters/meters.signals'
import { batch, computed, effect, signal } from '@preact/signals-react'
import moment from 'moment'
import { unflattenObject } from '@utils/DataUtils'
import {
  DetailedMeasurementSelector,
  type DetailedMeasurementWithSummaryAndContract,
} from '@/measurements/measurements.selector'
import { RunOnDB } from '@/database'

export const selectedYear = signal('')
export const measurementsForSelectedMeterLoading = signal(false)
export const measurementsForSelectedMeter = signal<
  Array<DetailedMeasurementWithSummaryAndContract>
>([])

export const measurementsForSelectedMeterGroupedByMonth = computed<
  Array<[string, Array<DetailedMeasurementWithSummaryAndContract>]>
>(() => {
  const clusters = measurementsForSelectedMeter.value.reduce(
    (acc, curr) => {
      const key = moment(curr.createdAt).format('MMM yyyy')
      if (!(key in acc)) {
        acc[key] = []
      }
      acc[key] = [...acc[key], curr].sort((a, b) => b.createdAt - a.createdAt)

      return acc
    },
    {} as Record<string, Array<DetailedMeasurementWithSummaryAndContract>>
  )

  return Object.entries(clusters).sort(([a], [b]) => {
    const [monthA, yearA] = a.split(' ')
    const [monthB, yearB] = b.split(' ')

    if (yearA !== yearB) return parseInt(yearB) - parseInt(yearA)

    return moment().month(monthB).valueOf() - moment().month(monthA).valueOf()
  })
})

//region Charts
export type DataEntry = { value: number; date: number }
export const dailyUsagesForSelectedMeter = computed<Array<[string, Array<DataEntry>]>>(() => {
  const selectedMeter = selectedMeterSignal.peek()
  const clusters = measurementsForSelectedMeter.value.reduce(
    (acc, curr) => {
      const year = moment(curr.createdAt).format('yyyy')
      if (!(year in acc)) {
        acc[year] = []
      }

      const dateNoYear = moment(curr.createdAt).year(0).valueOf()

      // If the previous measurement is 0 and the one before that is 0, we assume that the meter got its first value
      const value = {
        value:
          !curr.difference ||
          curr.daysBetween === null ||
          !curr.prevDifference ||
          curr.prevValue === null
            ? 0
            : curr.difference / (curr.daysBetween || 1),
        date: dateNoYear,
      }

      if (
        selectedMeter?.isRefillable &&
        ((selectedMeter.areValuesDepleting && value.value < 0) ||
          (!selectedMeter.areValuesDepleting && value.value > 0))
      ) {
        value.value = 0
      }

      acc[year].push(value)
      return acc
    },
    {} as Record<string, Array<DataEntry>>
  )
  return Object.entries(clusters)
})
//endregion

//region Data Retrieval
effect(() => {
  if (!selectedMeterSignal.value?.id) {
    measurementsForSelectedMeter.value = []
    return
  }

  const loadMeasurements = async () => {
    const selectedMeterId = selectedMeterSignal.value!.id
    console.log('[MEASUREMENT] Load Data')

    measurementsForSelectedMeterLoading.value = true
    const res = await RunOnDB(DetailedMeasurementSelector, [selectedMeterId])

    batch(() => {
      measurementsForSelectedMeter.value = res.rows._array.map(
        unflattenObject<DetailedMeasurementWithSummaryAndContract>
      )
      measurementsForSelectedMeterLoading.value = false
    })
  }

  console.log('[MEASUREMENT] Initial')
  loadMeasurements().catch((err) => {
    console.error('[MEASUREMENT] Error loading data', err)
  })

  EventEmitter.subscribe(EVENT_INVALIDATE_MEASUREMENTS, loadMeasurements)
  return () => {
    EventEmitter.unsubscribe(EVENT_INVALIDATE_MEASUREMENTS, loadMeasurements)
  }
})
//endregion
