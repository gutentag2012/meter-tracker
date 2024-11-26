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
