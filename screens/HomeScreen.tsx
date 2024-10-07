import { type DetailedBuilding } from '@/buildings/buildings.selector'
import { BuildingsListView } from '@/buildings/components'
import { ContractListView } from '@/contracts/components'
import { selectedYear } from '@/measurements/measurement.signals'
import { MeterListView } from '@/meters/components/MetersListView'
import { selectedMeterSignal } from '@/meters/meters.signals'
import { settings } from '@/settings'
import { batch } from '@preact/signals-react'
import { StyleSheet } from 'react-native'
import { ScrollView } from 'react-native-gesture-handler'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Colors, Text, View } from 'react-native-ui-lib'
import { AppBar } from '../components/AppBar'
import { Button } from '../components/Button'
import { FloatingActionButton } from '../components/FloatingActionButton'
import { GlobalToast } from '../components/GlobalToast'
import { IconButton } from '../components/IconButton'
import { AddIcon } from '../components/icons/AddIcon'
import { SettingsIcon } from '../components/icons/SettingsIcon'
import { type HomeStackScreenProps } from '../navigation/types'
import { t } from '@/i18n'
import { Typography } from '../setupTheme'
import { BuildingPicker } from '@/buildings/components/BuildingPicker'

// TODO Order by drag and drop
export default function HomeScreen({ navigation }: HomeStackScreenProps<'Home'>) {
  return (
    <SafeAreaView style={styles.container}>
      <AppBar
        title={t('home_screen:title')}
        actions={
          <>
            <BuildingPicker />
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

        <MeterListView
          onPress={(meter) => {
            batch(() => {
              selectedYear.value = ''
              selectedMeterSignal.value = meter
            })
            navigation.navigate('MeterSummaryScreen', {
              meter,
            })
          }}
          navigateToAddMeasurement={(meter) =>
            navigation.navigate('AddMeasurementModal', { meter })
          }
        />

        <Button
          style={styles.button}
          label={t('home_screen:add_new_meter')}
          icon={AddIcon}
          onPress={() => navigation.navigate('AddMeterModal', {})}
        />

        <Text style={styles.sectionTitle} onSurface>
          {t('home_screen:contracts_section_title')}
        </Text>

        <ContractListView
          onPress={(contract) =>
            navigation.navigate('AddContractModal', {
              editContract: contract,
            })
          }
        />

        <Button
          style={styles.button}
          label={t('home_screen:add_new_contract')}
          icon={AddIcon}
          onPress={() => navigation.navigate('AddContractModal', {})}
        />
        {settings.featureFlagMultipleBuildings.content.value && (
          <View>
            <Text style={styles.sectionTitle} onSurface>
              Gebäude verwalten
            </Text>

            <BuildingsListView
              onPress={(building: DetailedBuilding) =>
                navigation.navigate('AddBuildingModal', {
                  editBuilding: building,
                })
              }
            />

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
