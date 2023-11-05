import AsyncStorage from '@react-native-async-storage/async-storage'
import { StatusBar } from 'expo-status-bar'
import * as React from 'react'
import { useCallback, useEffect, useState } from 'react'
import { Platform, ScrollView, StyleSheet } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Colors, Text, View } from 'react-native-ui-lib'
import { AppBar } from '../components/AppBar'
import { Button } from '../components/Button'
import { GlobalToast } from '../components/GlobalToast'
import { IconButton } from '../components/IconButton'
import { BackIcon } from '../components/icons/BackIcon'
import { CheckCircleIcon } from '../components/icons/CheckCircleIcon'
import { ErrorCircleIcon } from '../components/icons/ErrorCircleIcon'
import { ExportIcon } from '../components/icons/ExportIcon'
import { ImportIcon } from '../components/icons/ImportIcon'
import { InfoCircleIcon } from '../components/icons/InfoCircleIcon'
import { NotificationIcon } from '../components/icons/NotificationIcon'
import { SettingsListEntry } from '../components/SettingsListEntry'
import AsyncStorageKeys from '../constants/AsyncStorageKeys'
import { type HomeStackScreenProps } from '../navigation/types'
import { clearDatabase, dropDatabase, reloadDatabase, setupDatabase } from '../services/database'
import EventEmitter from '../services/events'
import { t } from '../services/i18n'
import { Typography } from '../setupTheme'
import { databaseFromCSV, databaseToCSVString, shareCSVFile } from '../utils/DataUtils'
import { DefaultIntervalSetting, intervalToString } from '../utils/IntervalUtils'
import {
  checkNotificationPermissions,
  removeReminderNotification,
  scheduleReminderNotification,
} from '../utils/NotificationUtils'
import { IntervalDialog, type IntervalDialogProps } from './dialogs/IntervalDialog'
import {
  SingleTextFieldDialog,
  type SingleTextFieldDialogProps,
} from './dialogs/SingleTextFieldDialog'

export default function SettingsScreen({ navigation }: HomeStackScreenProps<'SettingsScreen'>) {
  const [values, setValues] = useState({
    [AsyncStorageKeys.ENABLE_REMINDER]: false,
    [AsyncStorageKeys.FEATURE_FLAG_MULTIPLE_BUILDINGS]: false,
    [AsyncStorageKeys.REMINDER_INTERVAL]: DefaultIntervalSetting,
    [AsyncStorageKeys.ENABLE_BACKUP_MAIL]: false,
  })

  const [singleTextFieldDialogState, setSingleTextFieldDialogState] = useState<
    Omit<SingleTextFieldDialogProps, 'onDismiss'>
  >({
    isVisible: false,
  })
  const [intervalDialogState, setIntervalDialogState] = useState<
    Omit<IntervalDialogProps, 'onDismiss'>
  >({
    isVisible: false,
  })
  const [enteredDangerZone, setEnteredDangerZone] = useState(false)

  const loadInitialValues = useCallback(async () => {
    const enableReminderPromise = AsyncStorage.getItem(AsyncStorageKeys.ENABLE_REMINDER).then(
      (v) => (v ? JSON.parse(v) : false)
    )
    const reminderIntervalPromise = AsyncStorage.getItem(AsyncStorageKeys.REMINDER_INTERVAL).then(
      (v) => (v ? JSON.parse(v) : DefaultIntervalSetting)
    )
    const enableBackupMailPromise = AsyncStorage.getItem(AsyncStorageKeys.ENABLE_BACKUP_MAIL).then(
      (v) => (v ? JSON.parse(v) : false)
    )
    const enableMultipleBuildingsPromise = AsyncStorage.getItem(
      AsyncStorageKeys.FEATURE_FLAG_MULTIPLE_BUILDINGS
    ).then((v) => (v ? JSON.parse(v) : false))

    const [enableReminder, reminderInterval, enableBackupMail, enableMultipleBuildings] =
      await Promise.all([
        enableReminderPromise,
        reminderIntervalPromise,
        enableBackupMailPromise,
        enableMultipleBuildingsPromise,
      ])

    setValues({
      [AsyncStorageKeys.ENABLE_REMINDER]: enableReminder,
      [AsyncStorageKeys.REMINDER_INTERVAL]: reminderInterval,
      [AsyncStorageKeys.ENABLE_BACKUP_MAIL]: enableBackupMail,
      [AsyncStorageKeys.FEATURE_FLAG_MULTIPLE_BUILDINGS]: enableMultipleBuildings,
    })
  }, [])

  useEffect(() => {
    loadInitialValues()
  }, [loadInitialValues])

  const setValue = useCallback(
    (key: keyof typeof values, value: unknown) => {
      EventEmitter.emit(`settings-${key}`, value)
      AsyncStorage.setItem(key, JSON.stringify(value)).then(() => {
        setValues({
          ...values,
          [key]: value,
        })
      })
    },
    [values]
  )

  useEffect(() => {
    if (!values[AsyncStorageKeys.ENABLE_REMINDER]) {
      return
    }
    checkNotificationPermissions()
  }, [values[AsyncStorageKeys.ENABLE_REMINDER]])

  return (
    <>
      <IntervalDialog
        isVisible={intervalDialogState.isVisible}
        initialValue={intervalDialogState.initialValue}
        title={intervalDialogState.title}
        onFinish={intervalDialogState.onFinish}
        onDismiss={() => setIntervalDialogState({ isVisible: false })}
      />
      <SafeAreaView style={styles.container} bg-backgroundColor>
        <AppBar
          title={t('utils:settings')}
          leftAction={
            <>
              <IconButton
                style={{ marginRight: 8 }}
                getIcon={() => <BackIcon color={Colors.onBackground} />}
                onPress={() => navigation.pop()}
              />
            </>
          }
        />
        <GlobalToast />

        <SingleTextFieldDialog
          isVisible={singleTextFieldDialogState.isVisible}
          initialValue={singleTextFieldDialogState.initialValue}
          inputType={singleTextFieldDialogState.inputType}
          label={singleTextFieldDialogState.label}
          onFinish={singleTextFieldDialogState.onFinish}
          onDismiss={() => setSingleTextFieldDialogState({ isVisible: false })}
        />

        <ScrollView>
          <Text style={styles.sectionTitle}>{t('utils:data')}</Text>
          <SettingsListEntry
            type="custom"
            getIcon={() => <ExportIcon />}
            onPress={async () => {
              await databaseToCSVString().then(shareCSVFile)
            }}
            title={t('utils:export_data')}
            getSubTitle={() => t('utils:export_data_description')}
          />
          <SettingsListEntry
            type="custom"
            getIcon={() => <ImportIcon />}
            onPress={() => databaseFromCSV(undefined, true)}
            title={t('utils:import_data')}
            getSubTitle={() => t('utils:import_data_description')}
          />

          <Text style={styles.sectionTitle}>{t('utils:reminder')}</Text>
          <SettingsListEntry
            type="checkbox"
            value={values[AsyncStorageKeys.ENABLE_REMINDER]}
            getIcon={() => <NotificationIcon />}
            onPress={() =>
              setValue(AsyncStorageKeys.ENABLE_REMINDER, !values[AsyncStorageKeys.ENABLE_REMINDER])
            }
            title={t('utils:enable_reminder')}
            getSubTitle={() => t('utils:enable_reminder_description')}
          />
          <SettingsListEntry
            type="custom"
            disabled={!values[AsyncStorageKeys.ENABLE_REMINDER]}
            value={values[AsyncStorageKeys.REMINDER_INTERVAL]}
            onPress={() => {
              setIntervalDialogState({
                isVisible: true,
                initialValue: values[AsyncStorageKeys.REMINDER_INTERVAL],
                title: t('utils:reminder_interval'),
                onFinish: async (value) => {
                  setValue(AsyncStorageKeys.REMINDER_INTERVAL, value)
                  if (value) {
                    await scheduleReminderNotification(value)
                  } else {
                    await removeReminderNotification()
                  }
                },
              })
            }}
            title={t('utils:reminder_interval')}
            getSubTitle={() => intervalToString(values[AsyncStorageKeys.REMINDER_INTERVAL])}
          />

          <Text style={styles.sectionTitle}>{t('utils:features')}</Text>
          <SettingsListEntry
            type="checkbox"
            value={values[AsyncStorageKeys.FEATURE_FLAG_MULTIPLE_BUILDINGS]}
            getIcon={() => <NotificationIcon />}
            onPress={() =>
              setValue(
                AsyncStorageKeys.FEATURE_FLAG_MULTIPLE_BUILDINGS,
                !values[AsyncStorageKeys.FEATURE_FLAG_MULTIPLE_BUILDINGS]
              )
            }
            title={t('utils:enable_multiple_buildings')}
            getSubTitle={() => t('utils:enable_multiple_buildings_description')}
            customHeight={72}
          />

          <Text style={styles.sectionTitle}>{t('utils:danger_zone')}</Text>
          <SettingsListEntry
            type="checkbox"
            value={enteredDangerZone}
            getIcon={() => <ErrorCircleIcon />}
            onPress={() => setEnteredDangerZone(!enteredDangerZone)}
            title={t('utils:enable_danger_zone')}
            getSubTitle={() => t('utils:enable_danger_zone_description')}
          />
          <View
            style={{
              paddingHorizontal: 16,
              marginTop: 24,
            }}
          >
            <Button
              color="error"
              label={t('utils:delete_all_data')}
              disabled={!enteredDangerZone}
              onPress={async () => {
                EventEmitter.emitToast({
                  message: t('utils:deleting_data'),
                  isLoading: true,
                  icon: InfoCircleIcon,
                })

                await clearDatabase()
                await dropDatabase()

                await AsyncStorage.getAllKeys()
                  .then(AsyncStorage.multiRemove)
                  .then(loadInitialValues)

                await setupDatabase()
                reloadDatabase()

                setEnteredDangerZone(false)

                EventEmitter.emit(`data-removed`)
                EventEmitter.emitToast({
                  message: t('utils:delete_finished'),
                  duration: 3000,
                  icon: CheckCircleIcon,
                })
              }}
            />
          </View>
        </ScrollView>

        <StatusBar style={Platform.OS === 'ios' ? 'light' : 'auto'} />
      </SafeAreaView>
    </>
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
  note: {
    ...Typography.BodySmall,
    color: Colors.onSurface,
    marginLeft: 16,
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
