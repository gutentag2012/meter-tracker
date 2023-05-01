import moment from 'moment'
import React, { FunctionComponent, useMemo } from 'react'
import { StyleSheet } from 'react-native'
import Ripple from 'react-native-material-ripple'
import { Avatar, Colors, Text, View } from 'react-native-ui-lib'
import { ThemeColors, Typography } from '../../constants/Theme'
import Measurement from '../../services/database/entities/measurement'

interface MeasurementListEntryProps {
  previousPreviousMeasurement?: Measurement
  previousMeasurement?: Measurement
  measurement: Measurement
  onPress?: () => void
}

type Props = MeasurementListEntryProps

export const MeasurementListEntry: FunctionComponent<Props> = ({
                                                                 measurement,
                                                                 previousMeasurement,
                                                                 previousPreviousMeasurement,
                                                                 onPress,
                                                               }) => {

  const dateLabel = useMemo(() => {
    const date = new Date(measurement.createdAt)
    return `${ date.getDate()
      .toString()
      .padStart(2, '0') }.${ (date.getMonth() + 1).toString()
      .padStart(2, '0') }`
  }, [measurement.createdAt])

  const deltaValue = useMemo(() => {
    if (!previousMeasurement) {
      return undefined
    }

    const daysBetween = moment(measurement.createdAt)
      .diff(moment(previousMeasurement.createdAt), 'days')
    const delta = measurement.value - previousMeasurement.value
    return delta / daysBetween
  }, [measurement, previousMeasurement])

  const deltaPrice = useMemo(() => {
    if (!measurement.meter?.contract?.pricePerUnit || deltaValue === undefined) {
      return undefined
    }
    return deltaValue * measurement.meter?.contract?.pricePerUnit / 100
  }, [deltaValue, measurement.meter?.contract])

  const percentileChange = useMemo(() => {
    if (!previousMeasurement || deltaValue === undefined || !previousPreviousMeasurement) {
      return undefined
    }
    const previousDaysBetween = moment(previousMeasurement.createdAt)
      .diff(moment(previousPreviousMeasurement.createdAt), 'days')
    const previousDelta = previousMeasurement.value - previousPreviousMeasurement.value
    const previousDeltaValue = previousDelta / previousDaysBetween

    return (deltaValue - previousDeltaValue) / previousDeltaValue * 100
  }, [deltaValue, previousMeasurement, previousPreviousMeasurement])

  return <Ripple
    style={ styles.container }
    rippleColor={ Colors.secondaryContainer }
    onPress={ onPress }
  >
    <Avatar
      size={ 32 }
      containerStyle={ {
        padding: 20,
        marginRight: 16,
      } }
      label={ dateLabel }
      backgroundColor={ (Colors as ThemeColors).secondaryContainer }
      labelColor={ (Colors as ThemeColors).onSecondaryContainer }
    />

    <View>
      <Text
        style={ styles.title }
        onSurface
      >
        { measurement.value } { measurement.meter?.unit }
      </Text>
      { deltaValue !== undefined && <Text
          style={ styles.subtitle }
          onSurfaceVariant
      >
        { deltaValue.toFixed(measurement.meter?.digits ?? 2) } { measurement.meter?.unit } per day
      </Text> }
      { deltaPrice !== undefined && <Text
          style={ styles.subtitle }
          onSurfaceVariant
      >
        { deltaPrice.toFixed(2) } € per day
      </Text> }
    </View>
    { percentileChange !== undefined && <Text
        style={ [styles.value, { color: percentileChange >= 0 && measurement.meter?.areValuesIncreasing ? Colors.tertiary : Colors.error }] }
        onSurfaceVariant
    >
      {percentileChange >= 0 && measurement.meter?.areValuesIncreasing && "+"}{ percentileChange.toFixed(2) }%
    </Text> }
  </Ripple>
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    height: 72,
    paddingVertical: 8,
    paddingLeft: 16,
    paddingRight: 24,
    flexDirection: 'row',
  },
  title: {
    ...Typography.BodyLarge,
  },
  subtitle: {
    ...Typography.BodySmall,
  },
  value: {
    marginLeft: 'auto',
    ...Typography.LabelSmall,
  },
})
