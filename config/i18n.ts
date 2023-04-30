import type { Language } from '../lang/en'

export const fallback = 'en' as const

export const supportedLocales = {
  en: {
    name: 'English',
    translationFileLoader: () => require('../lang/en').default,
    // en is default locale in Moment
    momentLocaleLoader: () => Promise.resolve(),
  },
  de: {
    name: 'Deutsch',
    translationFileLoader: () => require('../lang/de').default,
    momentLocaleLoader: () => require('moment/locale/de'),
  },
}

export const defaultNamespace: keyof Language = 'common'

export const namespaces: (keyof Language)[] = [
  'common',
  'home_screen',
  'meter',
  'contract',
  'utils',
  'validationMessage',
]
