import { computed, signal } from '@preact/signals-core'

export const isDatabaseMigrated = signal(false)
export const areFontsLoaded = signal(false)
export const numberOfSettingsLoaded = signal(0)
export const areSettingsLoaded = computed(() => numberOfSettingsLoaded.value >= 3)

export const isApplicationReady = computed(
  () => isDatabaseMigrated.value && areFontsLoaded.value && areSettingsLoaded.value
)
