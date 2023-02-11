import * as Notifications from 'expo-notifications'
import * as React from 'react'
import { useCallback, useEffect, useState } from 'react'
import { StyleSheet } from 'react-native'
import { RefreshControl, ScrollView } from 'react-native-gesture-handler'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Colors, Incubator, Text } from 'react-native-ui-lib'
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
import Measurement from '../services/database/entities/measurement'
import Meter from '../services/database/entities/meter'
import GenericRepository from '../services/database/GenericRepository'
import { t } from '../services/i18n'
import { RootStackScreenProps } from '../types'

const { TextField } = Incubator

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
})

export default function HomeScreen({ navigation }: RootStackScreenProps<'Root'>) {
  const [loading, setLoading] = useState(false)

  const [meters, setMeters] = useState<Array<Meter>>([])
  const [contracts, setContracts] = useState<Array<Contract>>([])

  const loadData = useCallback(() => {
      setLoading(true)
      const metersRequest = GenericRepository.getAllData<Meter>(Meter as any)
      const contractsRequest = GenericRepository.getAllData<Contract>(Contract as any)

      Promise.all([metersRequest, contractsRequest])
        .then(([meters, contracts]) => {
          setMeters(meters)
          setContracts(contracts)
          setLoading(false)
        })
    }, [],
  )

  useEffect(() => loadData(), [loadData])

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
            onClick={ () => console.log('Navigate to settings') }
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
          />)
        }
        <Button
          style={ styles.button }
          label={ t('home_screen:add_new_meter') }
          icon={ AddIcon }
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
        />
      </ScrollView>
      <FloatingActionButton
        icon={ AddIcon }
        onClick={ async () => {
          const contract = await GenericRepository.insertData(Contract as any, new Contract('Contract', 5.4))
          const meter = await GenericRepository.insertData(Meter as any, new Meter('Meter', Math.round(Math.random() * 4), 'kWh', contract.id))
          const date = Date.now() - (1000 * 60 * 60 * 24 * Math.random() * 30)
          await GenericRepository.insertData(Measurement as any, new Measurement(Math.random() * 1000, meter.id!, date))
        } }
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
