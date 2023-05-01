import { getLocales } from 'expo-localization'
import moment from 'moment'
import React, { FunctionComponent, useMemo } from 'react'
import { StyleSheet } from 'react-native'
import Ripple from 'react-native-material-ripple'
import { Colors, Text, View } from 'react-native-ui-lib'
import { Typography } from '../../constants/Theme'
import Meter from '../../services/database/entities/meter'
import { t } from '../../services/i18n'

interface MeterListEntryProps {
  meter: Meter,
  onPress?: (meter: Meter) => void,
}

type Props = MeterListEntryProps

export const MeterListEntry: FunctionComponent<Props> = ({ meter, onPress }) => {
  const subTitle = useMemo(() => {
    if (!meter.lastMeasurementDate) {
      return t('meter:no_previous_reading')
    }

    const formattedLastMeasurementDate = moment(meter.lastMeasurementDate)
      .format('LL')
    return t('meter:last_reading', { date: formattedLastMeasurementDate })
  }, [meter.lastMeasurementDate])

  const formattedValue = useMemo(() => t('meter:reading_value', {
    value: meter.lastMeasurementValue?.toFixed(meter.digits)
      ?.replace('.', getLocales()[0].decimalSeparator ?? ','),
    unit: meter.unit,
  }), [meter])

  return <Ripple
    style={ styles.container }
    rippleColor={ Colors.secondaryContainer }
    onPress={() => onPress?.(meter)}
  >
    <View>
      <Text
        style={ styles.title }
        onSurface
      >
        { meter.name }
      </Text>
      <Text
        style={ styles.subtitle }
        onSurfaceVariant
      >
        { subTitle }
      </Text>
    </View>
    <Text
      style={ styles.value }
      onSurfaceVariant
    >
      { formattedValue }
    </Text>
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
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  title: {
    ...Typography.BodyLarge,
  },
  subtitle: {
    ...Typography.BodySmall,
  },
  value: {
    ...Typography.LabelSmall,
  },
})
