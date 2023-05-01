import AsyncStorage from '@react-native-async-storage/async-storage'
import * as Notifications from 'expo-notifications'
import { Platform } from 'react-native'
import { Colors } from 'react-native-ui-lib'
import AsyncStorageKeys from '../constants/AsyncStorageKeys'
import { Interval } from './IntervalUtils'

const REMINDER_NOTIFICATION_CHANNEL_ID = 'reminder'
const REMINDER_NOTIFICATION_ID = 'reminder_notification'

const getReminderId = (interval: Interval) => {
  return REMINDER_NOTIFICATION_ID + (interval.type === 'Yearly' ? `_${ interval.monthOfYear }` : '')
}

const getReminderInterval = async (): Promise<Interval> => {
  return await AsyncStorage.getItem(AsyncStorageKeys.REMINDER_INTERVAL)
    .then(res => res ? JSON.parse(res) : undefined)
}

export const checkNotificationPermissions = async () => {
  const { status: existingStatus } = await Notifications.getPermissionsAsync()

  let finalStatus = existingStatus
  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync()
    finalStatus = status
  }

  return finalStatus === 'granted'
}

export const alreadyScheduledReminderNotification = async () => {
  const [interval, scheduled] = await Promise.all([
    getReminderInterval(), Notifications.getAllScheduledNotificationsAsync(),
  ])
  return scheduled.some(({ identifier }) => identifier === getReminderId(interval))
}

export const removeReminderNotification = async () => {
  const interval = await getReminderInterval()
  await Notifications.cancelScheduledNotificationAsync(getReminderId(interval))
}

export const scheduleReminderNotification = async (interval?: Interval) => {
  const shouldSchedule = await AsyncStorage.getItem(AsyncStorageKeys.ENABLE_REMINDER)
    .then(res => res === 'true')
  
  if (!shouldSchedule) {
    console.warn('Reminder is not enabled')
    return
  }

  if (!interval) {
    interval = await getReminderInterval()
  }

  if (!interval) {
    console.warn('No reminder interval set')
    return
  }

  const reminderId = getReminderId(interval)

  // TODO If that is the case maybe display a warning dialog
  if (!await checkNotificationPermissions()) {
    console.error('No notification permissions')
    return
  }

  // There is no monthly reminder, therefore 12 yearly reminders are scheduled
  if (interval.type === 'Monthly') {
    const promises = []
    for (let month = 1; month <= 12; month++) {
      promises.push(
        scheduleReminderNotification({
          type: 'Yearly',
          monthOfYear: month,
          dayOfMonth: interval.dayOfMonth,
          hour: interval.hour,
          minute: interval.minute,
        }),
      )
    }
    await Promise.all(promises)
    return
  }

  // For safety remove all notifications
  // TODO If new notifications are added, change here
  await Notifications.cancelAllScheduledNotificationsAsync()

  const notificationChannel = await Notifications.getNotificationChannelAsync(REMINDER_NOTIFICATION_CHANNEL_ID)
  if (Platform.OS === 'android' && !notificationChannel) {
    await Notifications.setNotificationChannelAsync(REMINDER_NOTIFICATION_CHANNEL_ID, {
      name: 'Reminder',
      importance: Notifications.AndroidImportance.MAX,
      sound: 'default',
      vibrationPattern: [0, 250, 250, 250],
      enableVibrate: true,
      lightColor: Colors.primary,
    })
  }

  const trigger = {
    repeats: true,
    channelId: REMINDER_NOTIFICATION_CHANNEL_ID,
    hour: interval.hour,
    minute: interval.minute,
  } as Record<string, any>

  if (interval.type === 'Weekly') {
    trigger.weekday = interval.dayOfWeek + 1
  }
  if (interval.type === 'Yearly') {
    trigger.month = interval.monthOfYear - 1
    trigger.day = interval.dayOfMonth
  }

  await Notifications.scheduleNotificationAsync({
    identifier: reminderId,
    content: {
      title: 'Reminder',
      color: Colors.primary,
      body: 'Please enter your meter readings',
    },
    trigger,
  })
}
