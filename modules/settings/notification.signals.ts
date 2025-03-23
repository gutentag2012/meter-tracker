import { signal } from '@preact/signals-core'
import { effect } from '@preact/signals-react'
import AsyncStorage from '@react-native-async-storage/async-storage'
import * as Notifications from 'expo-notifications'
import { Interval } from './notifications'
import { numberOfSettingsLoaded } from '@/modules/settings/settings.signals'
import { StorageKeys } from '@/modules/general/constants'

export enum PermissionStatus {
  GRANTED = 'granted',
  UNDETERMINED = 'undetermined',
  DENIED = 'denied',
}

export const DefaultInterval: Interval = {
  type: 'weekly',
  dayOf: 0,
  hour: 12,
  minute: 0,
}

export const reminderEnabled = signal(false)
export const interval = signal<Interval>(DefaultInterval)
export const notificationPermission = signal<
  Notifications.NotificationPermissionsStatus | undefined
>(undefined)

Notifications.getPermissionsAsync()
  .then((permissions) => {
    console.log("Loaded notification permissions")
    notificationPermission.value = permissions
    numberOfSettingsLoaded.value++
  })
  .catch((err) => console.error('Error getting notification permissions', err))
AsyncStorage.getItem(StorageKeys.notifications)
  .then((notificationFromStorage) => {
    console.log("Loaded notification interval")
    interval.value = notificationFromStorage
      ? JSON.parse(notificationFromStorage)
      : DefaultInterval
    numberOfSettingsLoaded.value++
  })
  .catch((err) => console.error('Error loading notification', err))
AsyncStorage.getItem(StorageKeys.notificationsLoaded)
  .then((notificationLoadedFromStorage) => {
    console.log("Loaded notification loaded")
    reminderEnabled.value = notificationLoadedFromStorage === 'true'
    numberOfSettingsLoaded.value++
  })
  .catch((err) => console.error('Error loading notification loaded', err))

let mountedInterval = false
effect(() => {
  const currentInterval = interval.value
  if (!mountedInterval) {
    mountedInterval = true
    return
  }
  AsyncStorage.setItem(
    StorageKeys.notifications,
    JSON.stringify(currentInterval),
  ).catch((err) => console.error('Error saving interval', err))
})

let mountedReminder = false
effect(() => {
  const currentReminder = reminderEnabled.value
  if (!mountedReminder) {
    mountedReminder = true
    return
  }
  AsyncStorage.setItem(
    StorageKeys.notificationsLoaded,
    currentReminder ? 'true' : 'false',
  ).catch((err) => console.error('Error saving reminder', err))
})
