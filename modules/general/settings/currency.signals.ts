import { getLocales } from 'expo-localization'
import { Storage } from '@/lib/constants/storage'
import { Currencies, Currency, CurrencyKeys } from '@/lib/constants/currencies'
import { computed, signal } from '@preact/signals-core'
import { effect } from '@preact/signals-react'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { numberOfSettingsLoaded } from '@/modules/general/setup.signals'

const locales = getLocales()

export const currencyCode = signal<CurrencyKeys | undefined>(undefined)
export const currency = computed(() => getCurrencyFromCode(currencyCode.value))

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

AsyncStorage.getItem(Storage.currency)
  .then((currencyFromStorage) => {
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
  AsyncStorage.setItem(Storage.currency, currentCurrency ?? '').catch((err) =>
    console.error('Error saving currency', err)
  )
})
