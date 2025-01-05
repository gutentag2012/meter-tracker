import { computed, effect, signal, useComputed } from '@preact/signals-react'
import {
  DarkColors,
  LightColors,
} from '@/modules/general/theme/theme.constants'
import { ColorSchemeName, useColorScheme } from 'react-native'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { StorageKeys } from '@/modules/general/constants'
import { numberOfSettingsLoaded } from '@/modules/settings/settings.signals'

export const colorScheme = signal<ColorSchemeName>(null)
export const themeColors = computed(() =>
  colorScheme.value === 'dark' ? DarkColors : LightColors,
)

AsyncStorage.getItem(StorageKeys.theme)
  .then((themeFromStorage) => {
    colorScheme.value = (themeFromStorage ?? undefined) as ColorSchemeName
    numberOfSettingsLoaded.value++
  })
  .catch((err) => console.error('Error loading theme', err))

let mountedTheme = false
effect(() => {
  const currentTheme = colorScheme.value
  if (!mountedTheme) {
    mountedTheme = true
    return
  }
  AsyncStorage.setItem(StorageKeys.theme, currentTheme ?? '').catch((err) =>
    console.error('Error saving theme', err),
  )
})

export function useSettingsTheme() {
  const systemSchema = useColorScheme()
  return useComputed(() => colorScheme.value ?? systemSchema)
}
