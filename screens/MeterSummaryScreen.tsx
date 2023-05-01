import * as React from 'react'
import { Fragment, useCallback, useEffect, useState } from 'react'
import { RefreshControl, ScrollView, StyleSheet } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Colors, Text } from 'react-native-ui-lib'
import { AppBar } from '../components/AppBar'
import { FloatingActionButton } from '../components/FloatingActionButton'
import { IconButton } from '../components/IconButton'
import { AddIcon } from '../components/icons/AddIcon'
import { BackIcon } from '../components/icons/BackIcon'
import { EditIcon } from '../components/icons/EditIcon'
import { SettingsIcon } from '../components/icons/SettingsIcon'
import { MeasurementListEntry } from '../components/measurements/MeasurementListEntry'
import { Typography } from '../constants/Theme'
import { HomeStackScreenProps } from '../navigation/types'
import Measurement from '../services/database/entities/measurement'
import Meter from '../services/database/entities/meter'
import { useRepository } from '../services/database/GenericRepository'
import MeasurementService from '../services/database/services/MeasurementService'
import MeterService from '../services/database/services/MeterService'
import EventEmitter from '../services/events'

type ClusteredMeasurements = Array<[string, Array<[Measurement, Measurement, Measurement]>]>

export default function MeterSummaryScreen({
                                             navigation,
                                             route,
                                           }: HomeStackScreenProps<'MeterSummaryScreen'>) {
  const [loading, setLoading] = useState(false)
  const [measurements, setMeasurements] = useState<ClusteredMeasurements>([])

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

      const year = new Date(measurement.createdAt).getFullYear()
      if (!clusters[year]) {
        clusters[year] = []
      }

      clusters[year].push([measurement, previousMeasurement, previousPreviousMeasurement])
    }

    setMeasurements(Object.entries(clusters)
      .sort(([a], [b]) => parseInt(b) - parseInt(a)))
    setLoading(false)
  }, [route.params.meter.id])

  useEffect(() => {
    loadData()

    const onUpdate = () => {
      setTimeout(() => loadData(), 100) // Small Timer for other transactions to settle
    }
    EventEmitter.subscribe(`data-inserted`, onUpdate)

    return () => EventEmitter.unsubscribe(`data-inserted`, onUpdate)
  }, [loadData])

  const onEndEditing = useCallback(async () => {
    setLoading(true)
    const newMeter = await meterRepo.getDataById<Meter>(route.params.meter.id!)
    navigation.setParams({ meter: newMeter })
    setLoading(false)
  }, [route.params.meter.id])

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
            onPress={ () => navigation.push('AddMeterModal', {
              editMeter: route.params.meter,
              onEndEditing,
            }) }
          />
          <IconButton
            getIcon={ () => <SettingsIcon color={ Colors.onBackground } /> }
            onPress={ () => console.log('Navigate to settings') }
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

        { measurements
          .map(([year, measurements]) => <Fragment key={ year }>
            <Text style={ styles.sectionTitle }>History { year }</Text>
            {
              measurements.map(([measurement, previousMeasurement, previousPreviousMeasurement]) =>
                <MeasurementListEntry
                  key={ measurement.id }
                  measurement={ measurement }
                  previousMeasurement={ previousMeasurement }
                  previousPreviousMeasurement={ previousPreviousMeasurement }
                  onPress={ () => navigation.push('AddMeasurementModal', {
                    meter: measurement.meter,
                    editMeasurement: measurement,
                    onEndEditing: loadData,
                  }) }
                />,
              )
            }
          </Fragment>) }

      </ScrollView>

      <FloatingActionButton
        icon={ AddIcon }
        onPress={ () => navigation.push('AddMeasurementModal', { meter: route.params.meter }) }
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
