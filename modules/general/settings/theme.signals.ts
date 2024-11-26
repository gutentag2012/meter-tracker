import { Storage } from '@/lib/constants/storage'
import { signal } from '@preact/signals-core'
import { effect } from '@preact/signals-react'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { numberOfSettingsLoaded } from '@/modules/general/setup.signals'
import { ColorSchemeName, useColorScheme } from 'react-native'

export const theme = signal<ColorSchemeName>(undefined)

AsyncStorage.getItem(Storage.theme)
  .then((themeFromStorage) => {
    theme.value = (themeFromStorage ?? undefined) as ColorSchemeName
    numberOfSettingsLoaded.value++
  })
  .catch((err) => console.error('Error loading theme', err))

let mountedTheme = false
effect(() => {
  const currentTheme = theme.value
  if (!mountedTheme) {
    mountedTheme = true
    return
  }
  AsyncStorage.setItem(Storage.theme, currentTheme ?? '').catch((err) =>
    console.error('Error saving theme', err)
  )
})

export function useSettingsTheme() {
  const systemTheme = useColorScheme()
  const currentTheme = theme.value
  return currentTheme ?? systemTheme
}
