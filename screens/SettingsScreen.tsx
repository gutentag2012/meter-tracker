import AsyncStorage from '@react-native-async-storage/async-storage'
import * as Notifications from 'expo-notifications'
import { StatusBar } from 'expo-status-bar'
import * as React from 'react'
import { useCallback, useEffect, useState } from 'react'
import { Platform, ScrollView, StyleSheet } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Colors, Text } from 'react-native-ui-lib'
import { AppBar } from '../components/AppBar'
import { IconButton } from '../components/IconButton'
import { BackIcon } from '../components/icons/BackIcon'
import { ExportIcon } from '../components/icons/ExportIcon'
import { ImportIcon } from '../components/icons/ImportIcon'
import { MailIcon } from '../components/icons/MailIcon'
import { NotificationIcon } from '../components/icons/NotificationIcon'
import { SettingsListEntry } from '../components/SettingsListEntry'
import AsyncStorageKeys from '../constants/AsyncStorageKeys'
import { Typography } from '../constants/Theme'
import { HomeStackScreenProps } from '../navigation/types'
import { DefaultIntervalSetting, intervalToString } from '../utils/IntervalUtils'
import { scheduleReminderNotification } from '../utils/NotificationUtils'
import { IntervalDialog, IntervalDialogProps } from './dialogs/IntervalDialog'
import { SingleTextFieldDialog, SingleTextFieldDialogProps } from './dialogs/SingleTextFieldDialog'

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
})

export default function SettingsScreen({ navigation }: HomeStackScreenProps<'SettingsScreen'>) {
  const [values, setValues] = useState({
    [AsyncStorageKeys.ENABLE_REMINDER]: false,
    [AsyncStorageKeys.REMINDER_INTERVAL]: DefaultIntervalSetting,
    [AsyncStorageKeys.ENABLE_BACKUP_MAIL]: false,
    [AsyncStorageKeys.BACKUP_MAIL_RECEIVER]: '',
    [AsyncStorageKeys.BACKUP_MAIL_INTERVAL]: DefaultIntervalSetting,
  })

  const [singleTextFieldDialogState, setSingleTextFieldDialogState] = useState<Omit<SingleTextFieldDialogProps, 'onDismiss'>>(
    {
      isVisible: false,
    })
  const [intervalDialogState, setIntervalDialogState] = useState<Omit<IntervalDialogProps, 'onDismiss'>>({
    isVisible: false,
  })

  useEffect(() => {
    const run = async () => {
      const enableReminderPromise = AsyncStorage.getItem(AsyncStorageKeys.ENABLE_REMINDER)
        .then(v => v ? JSON.parse(v) : false)
      const reminderIntervalPromise = AsyncStorage.getItem(AsyncStorageKeys.REMINDER_INTERVAL)
        .then(v => v ? JSON.parse(v) : DefaultIntervalSetting)
      const enableBackupMailPromise = AsyncStorage.getItem(AsyncStorageKeys.ENABLE_BACKUP_MAIL)
        .then(v => v ? JSON.parse(v) : false)
      const mailReceiverPromise = AsyncStorage.getItem(AsyncStorageKeys.BACKUP_MAIL_RECEIVER)
        .then(v => v ? JSON.parse(v) : '')
      const mailIntervalPromise = AsyncStorage.getItem(AsyncStorageKeys.BACKUP_MAIL_INTERVAL)
        .then(v => v ? JSON.parse(v) : DefaultIntervalSetting)

      const [enableReminder, reminderInterval, enableBackupMail, mailReceiver, mailInterval] = await Promise.all([
        enableReminderPromise,
        reminderIntervalPromise,
        enableBackupMailPromise,
        mailReceiverPromise,
        mailIntervalPromise,
      ])

      setValues({
        [AsyncStorageKeys.ENABLE_REMINDER]: enableReminder,
        [AsyncStorageKeys.REMINDER_INTERVAL]: reminderInterval,
        [AsyncStorageKeys.ENABLE_BACKUP_MAIL]: enableBackupMail,
        [AsyncStorageKeys.BACKUP_MAIL_RECEIVER]: mailReceiver,
        [AsyncStorageKeys.BACKUP_MAIL_INTERVAL]: mailInterval,
      })
    }
    run()
  }, [])

  const setValue = useCallback((key: keyof typeof values, value: any) => {
      AsyncStorage.setItem(key, JSON.stringify(value))
        .then(() => {
          setValues({
            ...values,
            [key]: value,
          })
        })
    }, [values],
  )

  return (
    <SafeAreaView
      style={ styles.container }
      bg-backgroundColor
    >
      <AppBar
        title={ 'Settings' }
        leftAction={ <>
          <IconButton
            style={ { marginRight: 8 } }
            getIcon={ () => <BackIcon color={ Colors.onBackground } /> }
            onPress={ () => navigation.pop() }
          />
        </> }
      />

      <SingleTextFieldDialog
        isVisible={ singleTextFieldDialogState.isVisible }
        initialValue={ singleTextFieldDialogState.initialValue }
        inputType={ singleTextFieldDialogState.inputType }
        label={ singleTextFieldDialogState.label }
        onFinish={ singleTextFieldDialogState.onFinish }
        onDismiss={ () => setSingleTextFieldDialogState({ isVisible: false }) }
      />

      <IntervalDialog
        isVisible={ intervalDialogState.isVisible }
        initialValue={ intervalDialogState.initialValue }
        title={ intervalDialogState.title }
        onFinish={ intervalDialogState.onFinish }
        onDismiss={ () => setIntervalDialogState({ isVisible: false }) }
      />

      <ScrollView>
        <Text style={ styles.sectionTitle }>Data</Text>
        <SettingsListEntry
          type='custom'
          getIcon={ () => <ExportIcon /> }
          title='Export data'
          getSubTitle={ () => 'Export your data as a CSV' }
        />
        <SettingsListEntry
          type='custom'
          getIcon={ () => <ImportIcon /> }
          title='Import data'
          getSubTitle={ () => 'Import your data from a CSV' }
        />

        <Text style={ styles.sectionTitle }>Reminder</Text>
        <SettingsListEntry
          type='checkbox'
          value={ values[AsyncStorageKeys.ENABLE_REMINDER] }
          getIcon={ () => <NotificationIcon /> }
          onPress={ () => setValue(AsyncStorageKeys.ENABLE_REMINDER, !values[AsyncStorageKeys.ENABLE_REMINDER]) }
          title='Enable Reminder'
          getSubTitle={ () => 'A regular reminder to enter values' }
        />
        <SettingsListEntry
          type='custom'
          disabled={ !values[AsyncStorageKeys.ENABLE_REMINDER] }
          value={ values[AsyncStorageKeys.REMINDER_INTERVAL] }
          onPress={ () => {
            setIntervalDialogState({
              isVisible: true,
              initialValue: values[AsyncStorageKeys.REMINDER_INTERVAL],
              title: 'Reminder Interval',
              onFinish: async (value) => {
                setValue(AsyncStorageKeys.REMINDER_INTERVAL, value)
                if (!!value) {
                  await scheduleReminderNotification(value)
                }
              },
            })
          } }
          title='Reminder Interval'
          getSubTitle={ () => intervalToString(values[AsyncStorageKeys.REMINDER_INTERVAL]) }
        />

        <Text style={ styles.sectionTitle }>Backup Mail</Text>
        <SettingsListEntry
          type='checkbox'
          value={ values[AsyncStorageKeys.ENABLE_BACKUP_MAIL] }
          getIcon={ () => <MailIcon /> }
          onPress={ () => setValue(AsyncStorageKeys.ENABLE_BACKUP_MAIL, !values[AsyncStorageKeys.ENABLE_BACKUP_MAIL]) }
          title='Enable Backup Mail'
          getSubTitle={ () => 'Sends a regular mail with your values' }
        />
        <SettingsListEntry
          type='email-address'
          disabled={ !values[AsyncStorageKeys.ENABLE_BACKUP_MAIL] }
          value={ values[AsyncStorageKeys.BACKUP_MAIL_RECEIVER] }
          onPress={ () => {
            setSingleTextFieldDialogState({
              isVisible: true,
              initialValue: values[AsyncStorageKeys.BACKUP_MAIL_RECEIVER],
              inputType: 'email-address',
              label: 'Receiver Address',
              onFinish: (value) => {
                setValue(AsyncStorageKeys.BACKUP_MAIL_RECEIVER, value)
              },
            })
          } }
          title='Receiver Address'
          getSubTitle={ () => values[AsyncStorageKeys.BACKUP_MAIL_RECEIVER] || 'No address found' }
        />
        <SettingsListEntry
          type='custom'
          disabled={ !values[AsyncStorageKeys.ENABLE_BACKUP_MAIL] }
          value={ values[AsyncStorageKeys.BACKUP_MAIL_INTERVAL] }
          onPress={ () => {
            setIntervalDialogState({
              isVisible: true,
              initialValue: values[AsyncStorageKeys.BACKUP_MAIL_INTERVAL],
              title: 'Backup Interval',
              onFinish: (value) => {
                setValue(AsyncStorageKeys.BACKUP_MAIL_INTERVAL, value)
              },
            })
          } }
          title='Backup Interval'
          getSubTitle={ () => intervalToString(values[AsyncStorageKeys.BACKUP_MAIL_INTERVAL]) }
        />
      </ScrollView>

      {/* Use a light status bar on iOS to account for the black space above the modal */ }
      <StatusBar style={ Platform.OS === 'ios' ? 'light' : 'auto' } />
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  chipActive: {
    marginRight: 8,
    borderColor: Colors.secondaryContainer,
    backgroundColor: Colors.secondaryContainer,
    color: Colors.onSecondaryContainer,
  },
  chipInactive: {
    marginRight: 8,
    borderColor: Colors.outline,
    color: Colors.onSurface,
  },
  sectionTitle: {
    ...Typography.LabelSmall,
    textAlignVertical: 'center',
    marginHorizontal: 16,
    marginVertical: 8,
  },
  titleDialog: {
    ...Typography.TitleSmall,
    marginBottom: 8,
    paddingHorizontal: 16,
  },
  button: {
    marginHorizontal: 16,
    marginVertical: 8,
  },
})
