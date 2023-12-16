import { AsyncStorageKeys } from '@utils/AsyncStorageUtils'
import { StatusBar } from 'expo-status-bar'
import * as React from 'react'
import { useState } from 'react'
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
import { type HomeStackScreenProps } from '../navigation/types'
import EventEmitter from '@/events'
import { t } from '@/i18n'
import { Typography } from '../setupTheme'
import { databaseFromCSV, databaseToCSVString, shareCSVFile } from '@utils/DataUtils'
import { intervalToString } from '@utils/IntervalUtils'
import { reloadDatabase, runMigrations } from '@/database'
import { batch, useSignal } from '@preact/signals-react'
import { resetSettings, setSetting, settings } from '@/settings/settings.signals'
import {
  SingleTextFieldDialog,
  type SingleTextFieldDialogProps,
} from '@/settings/components/SingleTextFieldDialog'
import { IntervalDialog, type IntervalDialogProps } from '@/settings/components/IntervalDialog'

// TODO Test if new settings are compatible with old ones

export default function SettingsScreen({ navigation }: HomeStackScreenProps<'SettingsScreen'>) {
  const [singleTextFieldDialogState, setSingleTextFieldDialogState] = useState<
    Omit<SingleTextFieldDialogProps, 'onDismiss'>
  >({
    isVisible: false,
  })

  const isIntervalDialogOpen = useSignal(false)
  const intervalDialogState = useSignal<IntervalDialogProps>({})

  const enteredDangerZone = useSignal(false)

  return (
    <>
      <IntervalDialog isVisible={isIntervalDialogOpen} state={intervalDialogState} />

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
              await databaseToCSVString().then((data) => {
                if (data) {
                  shareCSVFile(data)
                  return
                }

                EventEmitter.emitToast({
                  message: t('utils:no_data_to_export'),
                  duration: 3000,
                  icon: ErrorCircleIcon,
                })
              })
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
            value={settings.enableReminder.content}
            disabled={settings.enableReminder.isLoading.value}
            getIcon={() => <NotificationIcon />}
            onPress={() =>
              setSetting(AsyncStorageKeys.enableReminder, !settings.enableReminder.content.peek())
            }
            title={t('utils:enable_reminder')}
            getSubTitle={() => t('utils:enable_reminder_description')}
          />
          <SettingsListEntry
            type="custom"
            disabled={
              !settings.enableReminder.content.value || settings.reminderInterval.isLoading.value
            }
            value={settings.reminderInterval.content}
            onPress={() => {
              batch(() => {
                isIntervalDialogOpen.value = true
                intervalDialogState.value = {
                  initialValue: settings.reminderInterval.content.value,
                  title: t('utils:reminder_interval'),
                  onFinish: (value) => setSetting(AsyncStorageKeys.reminderInterval, value),
                }
              })
            }}
            title={t('utils:reminder_interval')}
            getSubTitle={() => intervalToString(settings.reminderInterval.content.value)}
          />

          <Text style={styles.sectionTitle}>{t('utils:features')}</Text>
          <SettingsListEntry
            type="checkbox"
            value={settings.featureFlagMultipleBuildings.content}
            disabled={settings.featureFlagMultipleBuildings.isLoading.value}
            getIcon={() => <NotificationIcon />}
            onPress={() =>
              setSetting(
                AsyncStorageKeys.featureFlagMultipleBuildings,
                !settings.featureFlagMultipleBuildings.content.peek()
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
            onPress={() => (enteredDangerZone.value = !enteredDangerZone.peek())}
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
              disabled={!enteredDangerZone.value}
              onPress={async () => {
                EventEmitter.emitToast({
                  message: t('utils:deleting_data'),
                  isLoading: true,
                  icon: InfoCircleIcon,
                })

                await resetSettings()
                await runMigrations(true)
                reloadDatabase()

                enteredDangerZone.value = false

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
