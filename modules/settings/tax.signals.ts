import { getLocales } from 'expo-localization'
import { signal } from '@preact/signals-core'
import { effect } from '@preact/signals-react'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { reloadAppAsync } from 'expo'
import { StorageKeys } from '@/modules/general/constants'
import { numberOfSettingsLoaded } from './settings.signals'
import { changeLocale, translate } from '@/modules/general/translations'

export const tax = signal(0)

AsyncStorage.getItem(StorageKeys.tax)
  .then((taxFromStorage) => {
    tax.value = taxFromStorage ? Number.parseFloat(taxFromStorage) : 0
    numberOfSettingsLoaded.value++
  })
  .catch((err) => console.error('Error loading tax', err))

let mountedTax = false
effect(() => {
  const currentTax = tax.value
  if (!mountedTax) {
    mountedTax = true
    return
  }
  AsyncStorage.setItem(StorageKeys.tax, currentTax.toString()).catch((err) =>
    console.error('Error saving tax', err),
  )
})
