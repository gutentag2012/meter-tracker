import { computed, signal } from '@preact/signals-react'

let AppResourcesToLoad = 0

export const DATABASE_RESOURCE = 1 << AppResourcesToLoad++
export const isDatabaseLoaded = computed(
  () => (currentlyLoadedResources.value & DATABASE_RESOURCE) === DATABASE_RESOURCE
)

export const SETTING_RESOURCE__ENABLE_REMINDER = 1 << AppResourcesToLoad++
export const SETTING_RESOURCE__REMINDER_INTERVAL = 1 << AppResourcesToLoad++
export const SETTING_RESOURCE__FEATURE_FLAG_MULTIPLE_BUILDINGS = 1 << AppResourcesToLoad++

export const NOTIFICATION_RESOURCE = 1 << AppResourcesToLoad++
export const I18N_RESOURCE = 1 << AppResourcesToLoad++
export const FONT_RESOURCE = 1 << AppResourcesToLoad++

const ALL_RESOURCES =
  DATABASE_RESOURCE |
  SETTING_RESOURCE__ENABLE_REMINDER |
  SETTING_RESOURCE__REMINDER_INTERVAL |
  SETTING_RESOURCE__FEATURE_FLAG_MULTIPLE_BUILDINGS |
  NOTIFICATION_RESOURCE |
  I18N_RESOURCE |
  FONT_RESOURCE

export const currentlyLoadedResources = signal(0)
export const loadedAllResources = computed(() => currentlyLoadedResources.value === ALL_RESOURCES)
