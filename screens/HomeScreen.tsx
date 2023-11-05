import * as Notifications from 'expo-notifications'
import * as React from 'react'
import { useCallback, useEffect, useState } from 'react'
import { StyleSheet } from 'react-native'
import { ScrollView } from 'react-native-gesture-handler'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Colors, Text, View } from 'react-native-ui-lib'
import { AppBar } from '../components/AppBar'
import { Button } from '../components/Button'
import { ContractListEntry } from '../components/contracts/ContractListEntry'
import { FloatingActionButton } from '../components/FloatingActionButton'
import { GlobalToast } from '../components/GlobalToast'
import { IconButton } from '../components/IconButton'
import { AddIcon } from '../components/icons/AddIcon'
import { SettingsIcon } from '../components/icons/SettingsIcon'
import { MeterListEntry } from '../components/meters/MeterListEntry'
import { type HomeStackScreenProps } from '../navigation/types'
import type Contract from '../services/database/entities/contract'
import type Meter from '../services/database/entities/meter'
import type GenericRepository from '../services/database/GenericRepository'
import { useUpdatedData } from '../services/database/GenericRepository'
import ContractService from '../services/database/services/ContractService'
import MeterService from '../services/database/services/MeterService'
import { t } from '../services/i18n'
import { Typography } from '../setupTheme'
import { scheduleReminderNotification } from '../utils/NotificationUtils'
import type Building from '../services/database/entities/building'
import { DEFAULT_BUILDING_ID } from '../services/database/entities/building'
import BuildingService from '../services/database/services/BuildingService'
import { BuildingPicker } from './BuildingPicker'
import { BuildingListEntry } from '../components/buildings/BuildingListEntry'
import { useAsyncStorageValue } from '../utils/CommonUtils'
import AsyncStorageKeys from '../constants/AsyncStorageKeys'

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

  const shouldShowBuildingsSelect = useAsyncStorageValue<boolean>(
    AsyncStorageKeys.FEATURE_FLAG_MULTIPLE_BUILDINGS
  )

  const [buildings, reloadBuildings] = useUpdatedData<Building, BuildingService>(BuildingService)
  const [selectedBuilding, setSelectedBuilding] = useState(DEFAULT_BUILDING_ID)

  useEffect(() => {
    if (buildings.some(({ id }) => id === selectedBuilding)) {
      return
    }

    setSelectedBuilding(DEFAULT_BUILDING_ID)
  }, [buildings, selectedBuilding])

  const getMetersForSelectedBuilding = useCallback(
    async (repo: GenericRepository<Meter>, service: MeterService) => {
      if (!shouldShowBuildingsSelect) return await repo.getAllData()

      const metersForBuildingQuery = service.getMetersForBuildingStatement(selectedBuilding)
      const res = await repo.executeRaw<Array<Record<string, unknown>>>(metersForBuildingQuery)
      if (!res) return []
      return res.map((meter) => service.fromJSON(meter))
    },
    [selectedBuilding, shouldShowBuildingsSelect]
  )
  const [meters, reloadMeters] = useUpdatedData<Meter, MeterService>(
    MeterService,
    getMetersForSelectedBuilding
  )

  const getContractsForSelectedBuilding = useCallback(
    async (repo: GenericRepository<Contract>, service: ContractService) => {
      if (!shouldShowBuildingsSelect) return await repo.getAllData()

      const contractsForBuildingQuery = service.getContractsForBuildingStatement(selectedBuilding)
      const res = await repo.executeRaw<Array<Record<string, unknown>>>(contractsForBuildingQuery)
      if (!res) return []
      return res.map((contract) => service.fromJSON(contract))
    },
    [selectedBuilding, shouldShowBuildingsSelect]
  )
  const [contracts, reloadContracts] = useUpdatedData<Contract, ContractService>(
    ContractService,
    getContractsForSelectedBuilding
  )

  const loadData = useCallback(async () => {
    await Promise.all([reloadMeters(), reloadContracts(), reloadBuildings()])
  }, [reloadMeters, reloadContracts, reloadBuildings])

  useEffect(() => {
    loadData()
  }, [loadData])

  return (
    <SafeAreaView style={styles.container}>
      <AppBar
        title={t('home_screen:title')}
        actions={
          <>
            {/* TODO Find a way to make clear, that these are the buildings */}
            {shouldShowBuildingsSelect && (
              <BuildingPicker
                value={selectedBuilding}
                setValue={setSelectedBuilding}
                buildings={buildings}
              />
            )}
            <IconButton
              getIcon={() => <SettingsIcon color={Colors.onBackground} />}
              onPress={() => navigation.navigate('SettingsScreen')}
            />
          </>
        }
      />

      <ScrollView>
        <Text style={styles.sectionTitle} onSurface>
          {t('home_screen:meters_section_title')}
        </Text>
        {meters.map((meter) => (
          <MeterListEntry
            key={meter.id}
            meter={meter}
            onPress={() => navigation.navigate('MeterSummaryScreen', { meter })}
            navigateToAddMeasurement={() => navigation.navigate('AddMeasurementModal', { meter })}
          />
        ))}
        <Button
          style={styles.button}
          label={t('home_screen:add_new_meter')}
          icon={AddIcon}
          onPress={() => navigation.navigate('AddMeterModal', {})}
        />

        <Text style={styles.sectionTitle} onSurface>
          {t('home_screen:contracts_section_title')}
        </Text>
        {contracts.map((contract) => (
          <ContractListEntry
            key={contract.id}
            contract={contract}
            onPress={() =>
              navigation.navigate('AddContractModal', {
                editContract: contract,
                onEndEditing: () => reloadContracts(),
              })
            }
          />
        ))}
        <Button
          style={styles.button}
          label={t('home_screen:add_new_contract')}
          icon={AddIcon}
          onPress={() => navigation.navigate('AddContractModal', {})}
        />
        {shouldShowBuildingsSelect && (
          <View>
            <Text style={styles.sectionTitle} onSurface>
              Gebäude verwalten
            </Text>

            {buildings
              .filter(({ id }) => id !== DEFAULT_BUILDING_ID)
              .map((building) => (
                <BuildingListEntry
                  building={building}
                  key={building.id}
                  onPress={() =>
                    navigation.navigate('AddBuildingModal', {
                      editBuilding: building,
                      onEndEditing: () => loadData(),
                    })
                  }
                />
              ))}
            <Button
              style={styles.button}
              label={t('buildings:add_building')}
              icon={AddIcon}
              onPress={() => navigation.navigate('AddBuildingModal', {})}
            />
          </View>
        )}
      </ScrollView>

      <GlobalToast
        renderAttachment={() => (
          <FloatingActionButton
            icon={AddIcon}
            onPress={() => navigation.navigate('AddMeasurementModal', {})}
          />
        )}
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
