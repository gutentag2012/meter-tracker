import moment from 'moment'

import { supportedLocales } from '../../config/i18n'

const date = {
  /**
   * Load library, setting its initial locale
   *
   * @param {string} locale
   * @return Promise
   */
  init(locale: keyof typeof supportedLocales) {
    return new Promise((resolve, reject) => {
      supportedLocales[locale]
        .momentLocaleLoader()
        .then(() => {
          moment.locale(locale)
          return resolve(undefined)
        })
        .catch((err: any) => reject(err))
    })
  },
  /**
   * @param {Date} date
   * @param {string} format
   * @return {string}
   */
  format(date: Date | number, format: string | undefined) {
    return moment(date)
      .format(format)
  },
}
export default date
