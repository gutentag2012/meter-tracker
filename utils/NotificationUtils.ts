import { settings } from '@/settings'
import { effect } from '@preact/signals-react'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { AsyncStorageKeys } from '@utils/AsyncStorageUtils'
import * as Notifications from 'expo-notifications'
import { Alert, Linking, Platform } from 'react-native'
import { Colors } from 'react-native-ui-lib'
import { t } from '@/i18n'
import { DefaultIntervalSetting, type Interval } from './IntervalUtils'

const REMINDER_NOTIFICATION_CHANNEL_ID = 'reminder'
const REMINDER_NOTIFICATION_ID = 'reminder_notification'

const getReminderId = (interval: Interval) => {
  return REMINDER_NOTIFICATION_ID + interval
    ? interval.type === 'Yearly'
      ? `_${interval.monthOfYear}`
      : ''
    : ''
}

const getReminderInterval = async (): Promise<Interval> => {
  return await AsyncStorage.getItem(AsyncStorageKeys.reminderInterval).then((res) =>
    res ? JSON.parse(res) : DefaultIntervalSetting
  )
}

const createNotificationChannel = async () => {
  if (Platform.OS !== 'android') {
    return
  }

  const notificationChannel = await Notifications.getNotificationChannelAsync(
    REMINDER_NOTIFICATION_CHANNEL_ID
  )

  if (notificationChannel) {
    return
  }

  await Notifications.setNotificationChannelAsync(REMINDER_NOTIFICATION_CHANNEL_ID, {
    name: 'Reminder',
    importance: Notifications.AndroidImportance.MAX,
    sound: 'default',
    vibrationPattern: [0, 250, 250, 250],
    enableVibrate: true,
    lightColor: Colors.primary,
  })
}

export const checkNotificationPermissions = async () => {
  // To display the permission dialog the channel has to be created first on android
  await createNotificationChannel()

  const res = await Notifications.getPermissionsAsync()

  if (res.granted) {
    return res.granted
  }

  if (res.canAskAgain) {
    const finalRes = await Notifications.requestPermissionsAsync()
    return finalRes.granted
  }

  return new Promise((resolve) => {
    Alert.alert(
      t('utils:notification_permission_dialog_title'),
      t('utils:notification_permission_dialog_message'),
      [
        {
          text: t('utils:notification_permission_dialog_cancel'),
          onPress: () => {
            resolve(false)
          },
        },
        {
          text: t('utils:notification_permission_dialog_goto_settings'),
          onPress: () => {
            Linking.openSettings()
            resolve(false)
          },
        },
      ],
      { cancelable: false }
    )
  })
}

export const removeReminderNotification = async () => {
  const interval = await getReminderInterval()
  if (!interval) {
    return
  }

  const reminderId = getReminderId(interval)
  console.log(`Removing reminder notification for "${reminderId}"`)
  await Notifications.cancelScheduledNotificationAsync(reminderId)
}

export const scheduleReminderNotification = async (interval?: Interval) => {
  const shouldSchedule = await AsyncStorage.getItem(AsyncStorageKeys.enableReminder).then(
    (res) => res === 'true'
  )

  if (!shouldSchedule) {
    await removeReminderNotification()
    return
  }

  if (!(await checkNotificationPermissions())) {
    console.error('No notification permissions')
    return
  }

  if (!interval) {
    interval = await getReminderInterval()
  }

  if (!interval) {
    console.log('No reminder interval set')
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
        })
      )
    }
    await Promise.all(promises)
    return
  }

  // For safety remove all notifications
  // ! If new notifications are added, change here
  await Notifications.cancelAllScheduledNotificationsAsync()

  const reminderId = getReminderId(interval)
  console.log(`Scheduling reminder notification for "${reminderId}"`)

  const trigger = {
    repeats: true,
    channelId: REMINDER_NOTIFICATION_CHANNEL_ID,
    hour: interval.hour,
    minute: interval.minute,
  } as Record<string, unknown>

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
      title: t('utils:reminder'),
      color: Colors.primary,
      body: t('utils:reminder_notification_body'),
    },
    trigger,
  })
}

effect(() => {
  if (
    settings.enableReminder.isLoading.value ||
    settings.reminderInterval.isLoading.value ||
    !settings.reminderInterval.content.value
  ) {
    return
  }

  scheduleReminderNotification(
    settings.enableReminder.content.value ? settings.reminderInterval.content.value : undefined
  )
})
