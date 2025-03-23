import {computed, effect, signal} from '@preact/signals-react'

const numberOfSettingsTotal = 6
export const numberOfSettingsLoaded = signal(0)

export const areSettingsLoaded = computed(
  () => numberOfSettingsLoaded.value === numberOfSettingsTotal,
)

effect(() => console.log(`Loading Progress [${numberOfSettingsLoaded.value}/${numberOfSettingsTotal}]`))