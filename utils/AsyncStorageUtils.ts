import AsyncStorage from '@react-native-async-storage/async-storage'
import { type Interval } from './IntervalUtils'

export type AsyncStorageTypes = {
  databaseVersion: number

  enableReminder: boolean
  reminderInterval: Interval

  featureFlagMultipleBuildings: boolean
}
export const AsyncStorageKeys = {
  databaseVersion: 'databaseVersion',

  enableReminder: 'enableReminder',
  reminderInterval: 'reminderInterval',

  featureFlagMultipleBuildings: 'featureFlagMultipleBuildings',
} as const
export type AsyncStorageKey = keyof AsyncStorageTypes

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
