import { en, LangKey } from './en'
import { de } from './de'
import { I18n } from 'i18n-js'
import { getLocales } from 'expo-localization'
import { TranslateOptions } from 'i18n-js/src/typing'
import { de as dateDe, enUS as dateEn } from 'date-fns/locale'
import { format, formatRelative } from 'date-fns'

const Translator = new I18n({
  en,
  de,
})

const locales = getLocales()
export const currencyData = {
  currencyCode: locales[0]?.currencyCode ?? 'USD',
  currencySymbol: locales[0]?.currencySymbol ?? '$',
  decimalSeparator: locales[0]?.decimalSeparator ?? '.',
  groupingSeparator: locales[0]?.digitGroupingSeparator ?? ',',
}

// TODO Remove static locale
const locale = ('de' || locales[0]?.languageCode) ?? 'en'
Translator.locale = locale
Translator.enableFallback = true

export function translate(key: LangKey, options?: TranslateOptions) {
  return Translator.t(key, options)
}

const dateFormateLocale = locale === 'de' ? dateDe : dateEn

export function formatDate(date: Date, dateFormat = 'PPP') {
  return format(date, dateFormat, { locale: dateFormateLocale })
}

export function formatNumber(number: number, precision?: number | null, ifNull = '-') {
  if (number === null) {
    return ifNull
  }
  precision ??= 2
  return Translator.numberToRounded(number, {
    precision,
    separator: currencyData.decimalSeparator,
    delimiter: currencyData.groupingSeparator,
  })
}
