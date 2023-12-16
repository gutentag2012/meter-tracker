import { DEFAULT_BUILDING_ID, EVENT_INVALIDATE_BUILDINGS } from '@/buildings/buildings.constants'
import { batch, effect, signal } from '@preact/signals-react'
import { isDatabaseLoaded } from '@utils/AppResources'
import { unflattenObject } from '@utils/DataUtils'
import { RunOnDB } from '@/database'
import { settings } from '@/settings'
import EventEmitter from '@/events'
import { type DetailedBuilding, DetailedBuildingSelector } from './buildings.selector'

export const detailedBuildingsLoading = signal(false)
export const detailedBuildings = signal<Array<DetailedBuilding>>([])
export const selectedBuilding = signal<DetailedBuilding['id']>(DEFAULT_BUILDING_ID)

//region Data Retrieval
effect(() => {
  if (!isDatabaseLoaded.value) {
    console.log('[BUILDINGS] Database not loaded, not loading buildings')
    return
  }

  // If the feature flag is enabled, then we want to load the buildings
  if (
    !settings.featureFlagMultipleBuildings.content.value ||
    settings.featureFlagMultipleBuildings.isLoading.value
  ) {
    console.log('[BUILDINGS] Feature flag disabled, not loading buildings')
    return
  }

  const loadBuildings = async () => {
    console.log('[BUILDINGS] Load Data')

    detailedBuildingsLoading.value = true

    const res = await RunOnDB(DetailedBuildingSelector, [])

    batch(() => {
      detailedBuildings.value = res.rows._array.map(unflattenObject<DetailedBuilding>)

      // If no building in the DB matches the currently selected one (e.g. the DB was reset)
      if (!detailedBuildings.peek().some((building) => building.id === selectedBuilding.peek())) {
        selectedBuilding.value = DEFAULT_BUILDING_ID
      }

      detailedBuildingsLoading.value = false
    })
  }

  console.log('[BUILDINGS] Initial')
  loadBuildings().catch((err) => {
    console.error('[BUILDINGS] Error loading data', err)
  })

  EventEmitter.subscribe(EVENT_INVALIDATE_BUILDINGS, loadBuildings)
  return () => EventEmitter.unsubscribe(EVENT_INVALIDATE_BUILDINGS, loadBuildings)
})
//endregion
