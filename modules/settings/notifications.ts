import { Alert, Linking, Platform } from 'react-native'
import * as Notifications from 'expo-notifications'
import {
  interval,
  notificationPermission,
  reminderEnabled,
} from '@/modules/settings/notification.signals'
import { formatDate, translate } from '../general/translations'
import { themeColors } from '@/modules/general/theme'
import { effect } from '@preact/signals-react'
import { SchedulableTriggerInputTypes } from 'expo-notifications/src/Notifications.types'

export const REMINDER_NOTIFICATION = {
  ID: 'reminder_notification',
  CHANNEL_ID: 'reminder',
}

interface IntervalDaily {
  type: 'daily'
  monthOfYear?: number
  dayOf?: number
  hour: number
  minute: number
}
interface IntervalWeekly {
  type: 'weekly'
  monthOfYear?: number
  dayOf: number
  hour: number
  minute: number
}
interface IntervalMonthly {
  type: 'monthly'
  monthOfYear?: number
  dayOf: number
  hour: number
  minute: number
}
interface IntervalYearly {
  type: 'yearly'
  monthOfYear: number
  dayOf: number
  hour: number
  minute: number
}
export type Interval =
  | IntervalDaily
  | IntervalWeekly
  | IntervalMonthly
  | IntervalYearly

export function translateInterval(interval?: Interval) {
  if (!interval) return ''

  const translatedType = translate(`intervals.${interval.type}`)
  switch (interval.type) {
    case 'daily':
      return `${translatedType} | ${interval.hour.toString().padStart(2, '0')}:${interval.minute.toString().padStart(2, '0')}`
    case 'weekly': {
      const d = new Date(1970, 0, 4 + interval.dayOf)
      return `${translatedType} | ${formatDate(d, 'EEEE')} | ${interval.hour.toString().padStart(2, '0')}:${interval.minute.toString().padStart(2, '0')}`
    }
    case 'monthly':
      return `${translatedType} | ${translate('general.day')} ${interval.dayOf} | ${interval.hour.toString().padStart(2, '0')}:${interval.minute.toString().padStart(2, '0')}`
    case 'yearly': {
      const d = new Date(1970, interval.monthOfYear - 1, interval.dayOf)
      return `${translatedType} | ${interval.dayOf.toString().padStart(2, '0')}. ${formatDate(d, 'MMMM')} | ${interval.hour.toString().padStart(2, '0')}:${interval.minute.toString().padStart(2, '0')}`
    }
  }
}

async function createNotificationChannel() {
  if (Platform.OS !== 'android') return

  const notificationChannel = await Notifications.getNotificationChannelAsync(
    REMINDER_NOTIFICATION.CHANNEL_ID,
  )
  if (notificationChannel) return

  await Notifications.setNotificationChannelAsync(
    REMINDER_NOTIFICATION.CHANNEL_ID,
    {
      name: translate('reminder.channel'),
      importance: Notifications.AndroidImportance.MAX,
      lockscreenVisibility: Notifications.AndroidNotificationVisibility.PUBLIC,
      sound: 'default',
      vibrationPattern: [0, 250, 250, 250],
      bypassDnd: true,
      showBadge: true,
      enableVibrate: true,
      enableLights: true,
      lightColor: themeColors.peek().primary,
    },
  )
}

async function checkNotificationPermission() {
  await createNotificationChannel()

  const res = await Notifications.getPermissionsAsync()
  if (notificationPermission.peek()?.status !== res.status) {
    notificationPermission.value = res
  }
  if (res.granted) {
    return res.granted
  }

  if (res.canAskAgain) {
    const finalRes = await Notifications.requestPermissionsAsync()
    if (notificationPermission.peek()?.status !== finalRes.status) {
      notificationPermission.value = finalRes
    }
    return finalRes.granted
  }

  return new Promise((resolve) => {
    Alert.alert(
      translate('settings.permissionDialogTitle'),
      translate('settings.permissionDialogDescription'),
      [
        {
          text: translate('general.cancel'),
          onPress: () => resolve(false),
        },
        {
          text: translate('settings.goToSettings'),
          onPress: () => {
            Linking.openSettings()
            resolve(false)
          },
        },
      ],
      { cancelable: false },
    )
  })
}

async function removeReminderNotification() {
  await Notifications.cancelAllScheduledNotificationsAsync()
}

// TODO Remove notifications if it has changed + do not schedule again if it is already the same notification
export async function scheduleReminderNotification(
  interval?: Interval,
  shouldCancel = true,
) {
  if (!reminderEnabled.peek()) {
    await removeReminderNotification()
    return false
  }

  if (!(await checkNotificationPermission())) {
    console.error('Permission denied')
    return false
  }

  if (!interval) {
    console.error('No interval')
    return false
  }

  if (shouldCancel) {
    await removeReminderNotification()
  }

  const trigger = {
    channelId: REMINDER_NOTIFICATION.CHANNEL_ID,
    repeats: true,
    type: SchedulableTriggerInputTypes.DAILY,
    hour: interval.hour,
    minute: interval.minute,
  } as any

  if (interval.type === 'weekly') {
    trigger.weekday = interval.dayOf + 1
    trigger.type = SchedulableTriggerInputTypes.WEEKLY
  }
  if (interval.type === 'monthly') {
    trigger.day = interval.dayOf
    trigger.type = SchedulableTriggerInputTypes.MONTHLY
  }
  if (interval.type === 'yearly') {
    trigger.month = interval.monthOfYear - 1
    trigger.day = interval.dayOf
    trigger.type = SchedulableTriggerInputTypes.YEARLY
  }

  const content = {
    title: translate('reminder.title'),
    color: '#fff',
    icon: 'assets/images/notification-icon.png',
    body: translate('reminder.body'),
  }

  await Notifications.scheduleNotificationAsync({
    identifier: REMINDER_NOTIFICATION.ID,
    content,
    trigger,
  })

  return true
}

effect(() => {
  const reminderConfig = interval.value
  const permission = notificationPermission.value
  if (!reminderEnabled.value || !permission) {
    return
  }
  scheduleReminderNotification(reminderConfig).then((success) => {
    if (success) return
    reminderEnabled.value = false
  })
})
