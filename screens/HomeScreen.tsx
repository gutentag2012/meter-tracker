import * as Notifications from 'expo-notifications'
import * as React from 'react'
import { useCallback, useEffect, useState } from 'react'
import { RefreshControl, ScrollView, StyleSheet } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Colors, Text } from 'react-native-ui-lib'
import { AppBar } from '../components/AppBar'
import { Button } from '../components/Button'
import { ContractListEntry } from '../components/contracts/ContractListEntry'
import { FloatingActionButton } from '../components/FloatingActionButton'
import { IconButton } from '../components/IconButton'
import { AddIcon } from '../components/icons/AddIcon'
import { SettingsIcon } from '../components/icons/SettingsIcon'
import { MeterListEntry } from '../components/meters/MeterListEntry'
import { Typography } from '../constants/Theme'
import Contract from '../services/database/entities/contract'
import Meter from '../services/database/entities/meter'
import { useUpdatedData } from '../services/database/GenericRepository'
import ContractService from '../services/database/services/ContractService'
import MeterService from '../services/database/services/MeterService'
import { t } from '../services/i18n'
import { HomeStackScreenProps } from '../navigation/types'

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
})

export default function HomeScreen({ navigation }: HomeStackScreenProps<'Home'>) {
  const [loading, setLoading] = useState(false)

  const [meters, reloadMeters] = useUpdatedData<Meter, MeterService>(MeterService)
  const [contracts, reloadContracts, contractRepo] = useUpdatedData<Contract, ContractService>(ContractService)

  const loadData = useCallback(async () => {
      setLoading(true)
      const p1 = reloadMeters()
      const p2 = reloadContracts()
      await Promise.all([p1, p2])
      setLoading(false)
    }, [reloadMeters, reloadContracts],
  )

  useEffect(() => {
    loadData()
      .catch(console.error)
  }, [loadData])

  return (
    <SafeAreaView
      style={ styles.container }
      bg-backgroundColor
    >
      <AppBar
        title={ t('home_screen:title') }
        actions={ <>
          <IconButton
            getIcon={ () => <SettingsIcon color={ Colors.onBackground } /> }
            onPress={ () => navigation.push("SettingsScreen") }
          />
        </> }
      />
      <ScrollView
        refreshControl={ <RefreshControl
          refreshing={ loading }
          onRefresh={ loadData }
          tintColor={ Colors.onSecondaryContainer }
          progressBackgroundColor={ Colors.secondaryContainer }
          colors={ [Colors.onSecondaryContainer] }
        /> }
      >
        <Text
          style={ styles.sectionTitle }
          onSurfaceVariant
        >
          { t('home_screen:meters_section_title') }
        </Text>
        {
          meters.map(meter => <MeterListEntry
            key={ meter.id }
            meter={ meter }
            onPress={ () => navigation.push('MeterSummaryScreen', { meter }) }
          />)
        }
        <Button
          style={ styles.button }
          label={ t('home_screen:add_new_meter') }
          icon={ AddIcon }
          onPress={ () => navigation.push('AddMeterModal', {}) }
        />

        <Text
          style={ styles.sectionTitle }
          onSurfaceVariant
        >
          { t('home_screen:contracts_section_title') }
        </Text>
        {
          contracts.map(contract => <ContractListEntry
            key={ contract.id }
            contract={ contract }
          />)
        }
        <Button
          style={ styles.button }
          label={ t('home_screen:add_new_contract') }
          icon={ AddIcon }
          onPress={ () => navigation.push('AddContractModal') }
        />
      </ScrollView>
      <FloatingActionButton
        icon={ AddIcon }
        onPress={ () => navigation.push('AddMeasurementModal', { meter: undefined }) }
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
