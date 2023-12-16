import { selectedBuilding } from '@/buildings/buildings.signals'
import { EVENT_INVALIDATE_MEASUREMENTS } from '@/measurements/measurements.constants'
import { EVENT_INVALIDATE_METERS } from '@/meters/meters.constants'
import {
  type DetailedMeter,
  DetailedMeterForBuildingSelector,
  DetailedMetersSelector,
  type DetailedMeterWithLastValue,
  type DetailedMeterWithValueSummary,
} from '@/meters/meters.selector'
import { effect, signal } from '@preact/signals-react'
import { isDatabaseLoaded } from '@utils/AppResources'
import { unflattenObject } from '@utils/DataUtils'
import { RunOnDB } from '@/database'
import EventEmitter from '@/events'

export const selectedMeterSignal = signal<DetailedMeter | undefined>(undefined)
export const detailedMeters = signal<Array<DetailedMeterWithLastValue>>([])
export const detailedMetersForBuilding = signal<Array<DetailedMeterWithValueSummary>>([])

//region Data Retrieval
effect(() => {
  if (!isDatabaseLoaded.value) {
    console.log('[METERS] Database not loaded, not loading meters')
    return
  }

  const loadMetersAll = async () => {
    const detailedMetersRes = await RunOnDB(DetailedMetersSelector, [])
    detailedMeters.value = detailedMetersRes.rows._array.map(
      unflattenObject<DetailedMeterWithLastValue>
    )
  }

  const loadMetersDetailed = async () => {
    const selectedBuildingValue = selectedBuilding.value
    const detailedMetersForBuildingsRes = await RunOnDB(DetailedMeterForBuildingSelector, [
      selectedBuildingValue,
    ])

    detailedMetersForBuilding.value = detailedMetersForBuildingsRes.rows._array.map(
      unflattenObject<DetailedMeterWithValueSummary>
    )
  }

  const loadMeters = async () => {
    console.log('[METERS] Load Data')

    await Promise.all([loadMetersAll(), loadMetersDetailed()])
  }

  console.log('[METERS] Initial')
  loadMeters().catch((err) => {
    console.error('[METERS] Error loading data', err)
  })

  EventEmitter.subscribe(EVENT_INVALIDATE_METERS, loadMeters)
  EventEmitter.subscribe(EVENT_INVALIDATE_MEASUREMENTS, loadMeters)
  return () => {
    EventEmitter.unsubscribe(EVENT_INVALIDATE_METERS, loadMeters)
    EventEmitter.unsubscribe(EVENT_INVALIDATE_MEASUREMENTS, loadMeters)
  }
})
//endregion
