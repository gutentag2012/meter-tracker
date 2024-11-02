import { computed, signal } from '@preact/signals-core'

export const isDatabaseMigrated = signal(false)
export const areFontsLoaded = signal(false)

export const isApplicationReady = computed(() => isDatabaseMigrated.value && areFontsLoaded.value)
