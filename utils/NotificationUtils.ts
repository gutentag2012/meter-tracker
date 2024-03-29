import AsyncStorage from '@react-native-async-storage/async-storage'
import * as Notifications from 'expo-notifications'
import { Alert, Linking, Platform } from 'react-native'
import { Colors } from 'react-native-ui-lib'
import AsyncStorageKeys from '../constants/AsyncStorageKeys'
import { t } from '../services/i18n'
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

const createNotificationChannel = async () => {
  if (Platform.OS !== 'android') {
    return
  }

  const notificationChannel = await Notifications.getNotificationChannelAsync(REMINDER_NOTIFICATION_CHANNEL_ID)

  if (!!notificationChannel) {
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

  return new Promise(resolve => {
    Alert.alert(
      t("utils:notification_permission_dialog_title"), t("utils:notification_permission_dialog_message"), [
        {
          text: t("utils:notification_permission_dialog_cancel"),
          onPress: () => {
            resolve(false)
          },
        },
        {
          text: t("utils:notification_permission_dialog_goto_settings"),
          onPress: () => {
            Linking.openSettings()
            resolve(false)
          },
        },
      ], { cancelable: false })
  })
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
    return
  }

  if (!await checkNotificationPermissions()) {
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

  const reminderId = getReminderId(interval)

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
  // ! If new notifications are added, change here
  await Notifications.cancelAllScheduledNotificationsAsync()

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
      title: t("utils:reminder"),
      color: Colors.primary,
      body: t("utils:reminder_notification_body"),
    },
    trigger,
  })
}
