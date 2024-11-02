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

const locale = ('de' || getLocales()[0].languageCode) ?? 'en'
Translator.locale = locale
Translator.enableFallback = true

export function translate(key: LangKey, options?: TranslateOptions) {
  return Translator.t(key, options)
}

const dateFormateLocale = locale === 'de' ? dateDe : dateEn
const relativeFormatLocale = {
  ...dateFormateLocale,
}

export function formateDate(date: Date, dateFormat = 'PPP') {
  return format(date, dateFormat, { locale: dateFormateLocale })
}

export function formateDateRelative(date: Date, dateSecond: Date) {
  return formatRelative(date, dateSecond, { locale: relativeFormatLocale })
}
