import AsyncStorage from '@react-native-async-storage/async-storage'
import { type Interval } from './IntervalUtils'

export type AsyncStorageTypes = {
  DATABASE_VERSION: number

  ENABLE_REMINDER: boolean
  REMINDER_INTERVAL: Interval

  FEATURE_FLAG_MULTIPLE_BUILDINGS: boolean
}
export type AsyncStorageKey = keyof AsyncStorageTypes
export const AsyncStorageKeys: {
  [Key in AsyncStorageKey]: Key
} = {
  DATABASE_VERSION: 'DATABASE_VERSION',

  ENABLE_REMINDER: 'ENABLE_REMINDER',
  REMINDER_INTERVAL: 'REMINDER_INTERVAL',

  FEATURE_FLAG_MULTIPLE_BUILDINGS: 'FEATURE_FLAG_MULTIPLE_BUILDINGS',
} as const

export const getAsyncValue = async <
  Key extends AsyncStorageKey,
  DefaultValue extends AsyncStorageTypes[Key] | undefined = undefined,
>(
  key: Key,
  defaultValue = undefined as DefaultValue
): Promise<AsyncStorageTypes[Key] | DefaultValue> => {
  const rawValue = await AsyncStorage.getItem(key)

  if (!rawValue) return defaultValue

  try {
    return JSON.parse(rawValue)
  } catch {
    return rawValue as unknown as AsyncStorageTypes[Key]
  }
}

export const setAsyncValue = <Key extends AsyncStorageKey>(
  key: Key,
  value?: AsyncStorageTypes[Key]
) => {
  if (!value) {
    return AsyncStorage.removeItem(key)
  }
  return AsyncStorage.setItem(key, JSON.stringify(value))
}
