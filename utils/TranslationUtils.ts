import { getLocales } from 'expo-localization'

export const parseValueForDigits = (value: number, digits?: number) => {
  return value.toFixed(digits ?? 2)
    .replace(',', '.')
    .replace('.', getLocales()[0].decimalSeparator ?? ',')
}
