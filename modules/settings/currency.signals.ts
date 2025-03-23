import { getLocales } from 'expo-localization'
import { computed, signal } from '@preact/signals-core'
import { effect } from '@preact/signals-react'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { numberOfSettingsLoaded } from '@/modules/settings/settings.signals'
import {
  StorageKeys,
  Currencies,
  Currency,
  CurrencyKeys,
} from '@/modules/general/constants'

const locales = getLocales()

export const currencyCode = signal<CurrencyKeys | undefined>(undefined)
export const currency = computed(() => getCurrencyFromCode(currencyCode.value))

AsyncStorage.getItem(StorageKeys.currency)
  .then((currencyFromStorage) => {
    console.log('Loaded currency')
    currencyCode.value = (currencyFromStorage ?? undefined) as CurrencyKeys
    numberOfSettingsLoaded.value++
  })
  .catch((err) => console.error('Error loading currency', err))

let mountedCurrency = false
effect(() => {
  const currentCurrency = currencyCode.value
  if (!mountedCurrency) {
    mountedCurrency = true
    return
  }
  AsyncStorage.setItem(StorageKeys.currency, currentCurrency ?? '').catch(
    (err) => console.error('Error saving currency', err),
  )
})

function getCurrencyFromCode(code: string | undefined) {
  code ||= locales[0]?.currencyCode ?? Currencies.EUR.currencyCode
  const currency = Currencies[code as CurrencyKeys]
  if (currency) {
    return currency
  }
  const foundLocale = locales.find((l) => l.currencyCode === code)
  if (!foundLocale) {
    return Currencies.EUR
  }
  return {
    currencyCode: foundLocale.currencyCode!,
    currencySymbol: foundLocale.currencySymbol!,
    decimalSeparator: foundLocale.decimalSeparator!,
    groupingSeparator: foundLocale.digitGroupingSeparator!,
  } as Currency
}
