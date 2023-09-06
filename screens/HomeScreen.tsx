import * as Notifications from 'expo-notifications'
import * as React from 'react'
import { useCallback, useEffect, useState } from 'react'
import { RefreshControl, StyleSheet } from 'react-native'
import { ScrollView } from 'react-native-gesture-handler'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Colors, Text } from 'react-native-ui-lib'
import { AppBar } from '../components/AppBar'
import { Button } from '../components/Button'
import { ContractListEntry } from '../components/contracts/ContractListEntry'
import { FloatingActionButton } from '../components/FloatingActionButton'
import { GlobalToast } from '../components/GlobalToast'
import { IconButton } from '../components/IconButton'
import { AddIcon } from '../components/icons/AddIcon'
import { SettingsIcon } from '../components/icons/SettingsIcon'
import { MeterListEntry } from '../components/meters/MeterListEntry'
import { HomeStackScreenProps } from '../navigation/types'
import Contract from '../services/database/entities/contract'
import Meter from '../services/database/entities/meter'
import { useUpdatedData } from '../services/database/GenericRepository'
import ContractService from '../services/database/services/ContractService'
import MeterService from '../services/database/services/MeterService'
import { t } from '../services/i18n'
import { Typography } from '../setupTheme'
import { scheduleReminderNotification } from '../utils/NotificationUtils'

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
})

// TODO Order by drag and drop
export default function HomeScreen({ navigation }: HomeStackScreenProps<'Home'>) {
  // Schedule Reminder Notification
  useEffect(() => {
    scheduleReminderNotification()
  }, [])

  const [loading, setLoading] = useState(false)

  const [meters, reloadMeters] = useUpdatedData<Meter, MeterService>(MeterService)
  const [contracts, reloadContracts] = useUpdatedData<Contract, ContractService>(ContractService)

  const loadData = useCallback(async () => {
      setLoading(true)
      await Promise.all([reloadMeters(), reloadContracts()])
      setLoading(false)
    }, [reloadMeters, reloadContracts],
  )

  useEffect(() => {
    loadData()
  }, [loadData])

  return (
    <SafeAreaView style={ styles.container }>
      <AppBar
        title={ t('home_screen:title') }
        actions={ <>
          <IconButton
            getIcon={ () => <SettingsIcon color={ Colors.onBackground } /> }
            onPress={ () => navigation.navigate('SettingsScreen') }
          />
        </> }
      />

      <ScrollView>
        <Text
          style={ styles.sectionTitle }
          onSurface
        >
          { t('home_screen:meters_section_title') }
        </Text>
        {
          meters.map(meter => <MeterListEntry
            key={ meter.id }
            meter={ meter }
            onPress={ () => navigation.navigate('MeterSummaryScreen', { meter }) }
            navigateToAddMeasurement={ () => navigation.navigate('AddMeasurementModal', { meter }) }
          />)
        }
        <Button
          style={ styles.button }
          label={ t('home_screen:add_new_meter') }
          icon={ AddIcon }
          onPress={ () => navigation.navigate('AddMeterModal', {}) }
        />

        <Text
          style={ styles.sectionTitle }
          onSurface
        >
          { t('home_screen:contracts_section_title') }
        </Text>
        {
          contracts.map(contract => <ContractListEntry
            key={ contract.id }
            contract={ contract }
            onPress={ () => navigation.navigate('AddContractModal', {
              editContract: contract,
              onEndEditing: reloadContracts,
            }) }
          />)
        }
        <Button
          style={ styles.button }
          label={ t('home_screen:add_new_contract') }
          icon={ AddIcon }
          onPress={ () => navigation.navigate('AddContractModal', {}) }
        />
      </ScrollView>


      <GlobalToast
        renderAttachment={ () =>
          <FloatingActionButton
            icon={ AddIcon }
            onPress={ () => navigation.navigate('AddMeasurementModal', {}) }
          />
        }
      />
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  sectionTitle: {
    ...Typography.LabelSmall,
    textAlignVertical: 'center',
    marginHorizontal: 16,
    marginVertical: 8,
  },
  button: {
    marginHorizontal: 16,
    marginVertical: 8,
  },
})
