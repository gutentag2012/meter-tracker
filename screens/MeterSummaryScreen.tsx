import moment from 'moment'
import * as React from 'react'
import { useCallback, useMemo, useState } from 'react'
import {
  Animated,
  Dimensions,
  RefreshControl,
  SectionList,
  SectionListRenderItem,
  StyleSheet,
  TouchableOpacity,
  useWindowDimensions,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { SceneMap, SceneRendererProps, TabView } from 'react-native-tab-view'
import { Colors, Text, View } from 'react-native-ui-lib'
import { AppBar } from '../components/AppBar'
import { FloatingActionButton } from '../components/FloatingActionButton'
import { GlobalToast } from '../components/GlobalToast'
import { IconButton } from '../components/IconButton'
import { AddIcon } from '../components/icons/AddIcon'
import { BackIcon } from '../components/icons/BackIcon'
import { CheckCircleIcon } from '../components/icons/CheckCircleIcon'
import { EditIcon } from '../components/icons/EditIcon'
import { SettingsIcon } from '../components/icons/SettingsIcon'
import { MeasurementListEntry } from '../components/measurements/MeasurementListEntry'
import {
  MeasurementDailyUsagePerDayChart,
  YearlyChunkSize,
} from '../components/meters/MeasurementDailyUsagePerDayChart'
import { MeasurementTotalYearlyUsageChart } from '../components/meters/MeasurementTotalYearlyUsageChart'
import { HomeStackScreenProps } from '../navigation/types'
import Measurement from '../services/database/entities/measurement'
import Meter from '../services/database/entities/meter'
import { useManualUpdatedData, useRepository } from '../services/database/GenericRepository'
import MeasurementService from '../services/database/services/MeasurementService'
import MeterService from '../services/database/services/MeterService'
import EventEmitter from '../services/events'
import { t } from '../services/i18n'
import { Typography } from '../setupTheme'

export type MeasurementHistory = [Measurement, Measurement, Measurement]
export type ClusteredMeasurements = Array<[string, Array<MeasurementHistory>]>

type SceneProps = {
  route: any;
} & Omit<SceneRendererProps, 'layout'>;

const MeasurementDailyUsage = (props: SceneProps) => <View>
  <Text style={ styles.sectionTitle }>
    { t('meter:usage_per_day') }
  </Text>
  <MeasurementDailyUsagePerDayChart measurements={ props.route.measurements } />
</View>

const MeasurementTotalUsage = (props: SceneProps) => <View>
  <Text style={ styles.sectionTitle }>
    { t('meter:usage_per_year') }
  </Text>
  <MeasurementTotalYearlyUsageChart measurements={ props.route.measurements } />
</View>

const renderScene = SceneMap({
  yearlyDailyUsage: MeasurementDailyUsage,
  yearlyTotalUsage: MeasurementTotalUsage,
})

export default function MeterSummaryScreen({
                                             navigation,
                                             route,
                                           }: HomeStackScreenProps<'MeterSummaryScreen'>) {
  const layout = useWindowDimensions()

  const [loading, setLoading] = useState(true)
  const [measurements, setMeasurements] = useState<ClusteredMeasurements>([])

  const [index, setIndex] = useState(0)
  const routes = useMemo(() => [
    {
      key: 'yearlyDailyUsage',
      measurements,
    },
    {
      key: 'yearlyTotalUsage',
      measurements,
    },
  ], [measurements])

  const [repo, service] = useRepository(MeasurementService)
  const [meterRepo] = useRepository(MeterService)

  const loadData = useCallback(async () => {
    setLoading(true)

    const getMeasurementStatement = service.getMeasurementsForMeter(route.params.meter.id!)
    const measurements = await repo.executeRaw<Array<unknown>>(getMeasurementStatement)
      .then(res => res?.map(json => service.fromJSON(json)) ?? [])

    const clusters: { [year: string]: Array<[Measurement, Measurement, Measurement]> } = {}

    const measurementsCopy = measurements.slice()
    const measurementsShifted = measurements.slice(1)
    const measurementsShiftedTwice = measurements.slice(2)

    for (let i = 0; i < measurementsCopy.length; i++) {
      const measurement = measurementsCopy[i]
      const previousMeasurement = measurementsShifted[i]
      const previousPreviousMeasurement = measurementsShiftedTwice[i]

      const year = moment(measurement.createdAt)
        .format('YYYY')
      if (!clusters[year]) {
        clusters[year] = []
      }

      clusters[year].push([
        measurement, previousMeasurement, previousPreviousMeasurement,
      ])
    }

    setMeasurements(Object.entries(clusters)
      .sort(([a], [b]) => parseInt(b) - parseInt(a)),
    )

    setLoading(false)
  }, [route.params.meter.id])

  useManualUpdatedData(loadData, ['data-inserted'])

  const onEndEditing = useCallback(async () => {
    setLoading(true)
    const newMeter = await meterRepo.getDataById<Meter>(route.params.meter.id!)
    navigation.setParams({ meter: newMeter })
    setLoading(false)
  }, [route.params.meter.id])

  const renderListItem: SectionListRenderItem<MeasurementHistory> = useCallback(({
                                                                                   item: [measurement, previousMeasurement, previousPreviousMeasurement],
                                                                                   section,
                                                                                 }) => {

    const onPress = useCallback(() => navigation.navigate('AddMeasurementModal', {
        meter: measurement.meter,
        editMeasurement: measurement,
        onEndEditing: loadData,
      }), [measurement, loadData, navigation],
    )

    const onDelete = useCallback(async () => {
      if (!measurement.id) {
        return
      }
      let didUndo = false

      setMeasurements(measurements.map(([title, data]) => {
        if (title !== section.title) {
          return [title, data]
        }
        return [title, data.filter(([m]) => m.id !== measurement.id)]
      }))

      await repo.deleteEntry(measurement.id)

      EventEmitter.emitToast({
        message: t('utils:deleted_reading'),
        icon: CheckCircleIcon,
        action: {
          label: t('utils:undo'),
          onPress: () => {
            if (didUndo) {
              return
            }

            didUndo = true
            EventEmitter.emitToast(undefined)
            repo.insertData(measurement)
          },
        },
        onDismiss: () => {
          if (didUndo) {
            return
          }

          loadData()
        },
      })
    }, [measurement, loadData, repo, measurements, section.title])

    return <MeasurementListEntry
      measurement={ measurement }
      previousMeasurement={ previousMeasurement }
      previousPreviousMeasurement={ previousPreviousMeasurement }
      onPress={ onPress }
      onDelete={ onDelete }
    />
  }, [measurements])

  // The height modifier is only used in the first screen, since it can have an overflow of years
  const heightModifier = index === 0 ? Math.ceil((measurements?.length ?? 0) / YearlyChunkSize) : 1
  return (
    <SafeAreaView
      style={ styles.container }
      bg-backgroundColor
    >
      <AppBar
        title={ route.params.meter.name }
        leftAction={ <>
          <IconButton
            style={ { marginRight: 8 } }
            getIcon={ () => <BackIcon color={ Colors.onBackground } /> }
            onPress={ () => navigation.pop() }
          />
        </> }
        actions={ <>
          <IconButton
            getIcon={ () => <EditIcon color={ Colors.onBackground } /> }
            onPress={ () => navigation.navigate('AddMeterModal', {
              editMeter: route.params.meter,
              onEndEditing,
            }) }
          />
          <IconButton
            getIcon={ () => <SettingsIcon color={ Colors.onBackground } /> }
            onPress={ () => navigation.navigate('SettingsScreen') }
          />
        </> }
      />

      <View
        style={ {
          height: Dimensions.get('window').width * 0.6 + 40 + 24 * heightModifier,
        } }
      >
        <TabView
          navigationState={ {
            index,
            routes,
          } }
          overScrollMode='always'
          tabBarPosition='bottom'
          renderTabBar={ (props) => {
            const inputRange = props.navigationState.routes.map((x, i) => i)

            return (
              <View
                style={ {
                  flexDirection: 'row',
                  justifyContent: 'center',
                  alignItems: 'center',
                } }
              >
                { props.navigationState.routes.map((route, i) => {

                  const opacity = props.position.interpolate({
                    inputRange,
                    outputRange: inputRange.map((inputIndex) =>
                      inputIndex === i ? 1 : 0.25,
                    ),
                  })
                  const size = props.position.interpolate({
                    inputRange,
                    outputRange: inputRange.map((inputIndex) =>
                      inputIndex === i ? 6 : 4,
                    ),
                  })

                  return (
                    <TouchableOpacity
                      key={ route.key }
                      style={ {
                        padding: 8,
                      } }
                      onPress={ () => setIndex(i) }
                    >
                      <Animated.View
                        style={ [
                          {
                            transform: [{ scale: size }],
                            width: 1,
                            height: 1,
                            backgroundColor: Colors.onBackground,
                            borderRadius: 8,
                          }, { opacity },
                        ] }
                      />
                    </TouchableOpacity>
                  )
                }) }
              </View>
            )
          } }
          renderScene={ renderScene }
          onIndexChange={ setIndex }
          initialLayout={ { width: layout.width } }
        />
      </View>

      <SectionList<MeasurementHistory>
        sections={ measurements.map(([title, data]) => ({
          title,
          data,
        })) }
        keyExtractor={ ([item]) => `${ item.id }` }
        initialNumToRender={ 15 }
        renderItem={ renderListItem }
        renderSectionHeader={ ({ section }) => <Text
          style={ styles.sectionTitle }
        >
          { t('utils:history') } { section.title }
        </Text> }
        stickySectionHeadersEnabled
        refreshControl={ <RefreshControl
          refreshing={ loading }
          onRefresh={ loadData }
          tintColor={ Colors.onSecondaryContainer }
          progressBackgroundColor={ Colors.secondaryContainer }
          colors={ [Colors.onSecondaryContainer] }
        /> }
      />

      <GlobalToast
        renderAttachment={ () => <FloatingActionButton
          icon={ AddIcon }
          onPress={ () => navigation.navigate('AddMeasurementModal', { meter: route.params.meter }) }
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
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: Colors.background,
    color: Colors.onBackground,
  },
  button: {
    marginHorizontal: 16,
    marginVertical: 8,
  },
})
