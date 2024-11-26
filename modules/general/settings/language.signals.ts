import { getLocales } from 'expo-localization'
import { Storage } from '@/lib/constants/storage'
import { signal } from '@preact/signals-core'
import { effect } from '@preact/signals-react'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { numberOfSettingsLoaded } from '@/modules/general/setup.signals'
import { translate, Translator } from '@/lib/translations/i18n'
import { reloadAppAsync } from 'expo'

const locales = getLocales()

let oldLanguage = locales[0]?.languageCode ?? 'en'
export const language = signal(oldLanguage)

AsyncStorage.getItem(Storage.language)
  .then((languageFromStorage) => {
    oldLanguage = languageFromStorage ?? locales[0]?.languageCode ?? 'en'
    language.value = oldLanguage as string
    numberOfSettingsLoaded.value++
  })
  .catch((err) => console.error('Error loading language', err))

let mountedLanguage = false
effect(() => {
  const currentLanguage = language.value
  if (!mountedLanguage) {
    mountedLanguage = true
    return
  }
  if (oldLanguage === currentLanguage) return
  Translator.locale = currentLanguage ?? locales[0]?.languageCode ?? 'en'
  AsyncStorage.setItem(Storage.language, currentLanguage ?? '').catch((err) =>
    console.error('Error saving language', err)
  )
  reloadAppAsync(translate('settings.languageChangeReloadReason')).catch((err) =>
    console.error('Error reloading app', err)
  )
  oldLanguage = currentLanguage
})
