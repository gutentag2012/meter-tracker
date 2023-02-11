import i18next, { Module } from 'i18next'
import { I18nManager as RNI18nManager } from 'react-native'
import * as config from '../../config/i18n'
import { supportedLocales } from '../../config/i18n'
import { LangKey } from '../../lang/en'
import date from './date'
import languageDetector from './language-detector'
import translationLoader from './translation-loader'

const i18n = {
  /**
   * @returns {Promise}
   */
  init: () => {
    return new Promise((resolve, reject) => {
      i18next
        .use(languageDetector)
        .use(translationLoader as Module)
        .init({
          compatibilityJSON: 'v3',
          fallbackLng: config.fallback,
          ns: config.namespaces,
          defaultNS: config.defaultNamespace,
          interpolation: {
            escapeValue: false,
            format(value, format) {
              if (!(value instanceof Date)) {
                return ''
              }
              return date.format(value, format)
            },
          },
        }, (error) => {
          if (error) { return reject(error) }
          date.init(Object.keys(supportedLocales)
                      .includes(i18next.language) ? i18next.language as keyof typeof supportedLocales : config.fallback)
            .then(resolve)
            .catch(error => reject(error))
        })
        .then(resolve)
    })
  },
  /**
   * @param {string} key
   * @param {Object} options
   * @returns {string}
   */
  // @ts-ignore
  t: (key: string, options?: any): string => i18next.t(key, options) as string,
  /**
   * @returns {string}
   */
  get locale() {
    return i18next.language
  },
  /**
   * @returns {'LTR' | 'RTL'}
   */
  get dir() {
    return i18next.dir()
      .toUpperCase()
  },
  /**
   * @returns {boolean}
   */
  get isRTL() {
    return RNI18nManager.isRTL
  },
  /**
   * Similar to React Native's Platform.select(),
   * i18n.select() takes a map with two keys, 'rtl'
   * and 'ltr'. It then returns the value referenced
   * by either of the keys, given the current
   * locale's direction.
   *
   * @param {Object<string,mixed>} map
   * @returns {mixed}
   */
  select(map: Record<string, any>) {
    const key = this.isRTL ? 'rtl' : 'ltr'
    return map[key]
  },
}
export const t = (key: LangKey, options?: any): string => {
  return i18n.t(key, options)
}
export default i18n
