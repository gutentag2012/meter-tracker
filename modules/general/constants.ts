export const StorageKeys = {
  language: 'language',
  tax: 'tax',
  currency: 'currency',
  theme: 'theme',
  notifications: 'notifications',
  notificationsLoaded: 'notificationsLoaded',
  didMigrateOldDB: 'didMigrateOldDB',
} as const

export const Currencies = {
  EUR: {
    currencyCode: 'EUR',
    currencySymbol: '€',
    decimalSeparator: ',',
    groupingSeparator: '.',
  },
  USD: {
    currencyCode: 'USD',
    currencySymbol: '$',
    decimalSeparator: '.',
    groupingSeparator: ',',
  },
  GBP: {
    currencyCode: 'GBP',
    currencySymbol: '£',
    decimalSeparator: '.',
    groupingSeparator: ',',
  },
} as const

export type CurrencyKeys = keyof typeof Currencies
export type Currency = (typeof Currencies)[CurrencyKeys]

export const Languages = {
  DE: 'de',
  EN: 'en',
} as const

export type LanguageKeys = keyof typeof Languages
export type Language = (typeof Languages)[LanguageKeys]

export const intervals = {
  DAILY: 'daily',
  WEEKLY: 'weekly',
  MONTHLY: 'monthly',
  YEARLY: 'yearly',
} as const

export const weekdayDates = [
  new Date(1970, 0, 5),
  new Date(1970, 0, 6),
  new Date(1970, 0, 7),
  new Date(1970, 0, 1),
  new Date(1970, 0, 2),
  new Date(1970, 0, 3),
  new Date(1970, 0, 4),
] as const

export const monthDates = [
  new Date(1970, 0, 1),
  new Date(1970, 1, 1),
  new Date(1970, 2, 1),
  new Date(1970, 3, 1),
  new Date(1970, 4, 1),
  new Date(1970, 5, 1),
  new Date(1970, 6, 1),
  new Date(1970, 7, 1),
  new Date(1970, 8, 1),
  new Date(1970, 9, 1),
  new Date(1970, 10, 1),
  new Date(1970, 11, 1),
] as const
