import moment from 'moment'
import React, { FunctionComponent, useMemo } from 'react'
import { StyleSheet } from 'react-native'
import Ripple from 'react-native-material-ripple'
import { Colors, Text, View } from 'react-native-ui-lib'
import Meter from '../../services/database/entities/meter'
import { t } from '../../services/i18n'
import { Typography } from '../../setupTheme'
import { parseValueForDigits } from '../../utils/TranslationUtils'
import { Button } from '../Button'
import { AddIcon } from '../icons/AddIcon'

type LongEvent = {
  pageY: number
}

interface MeterListEntryProps {
  meter: Meter,
  onPress?: () => void,
  navigateToAddMeasurement?: () => void,
}

type Props = MeterListEntryProps

export const MeterListEntry: FunctionComponent<Props> = ({
                                                           meter,
                                                           onPress,
                                                           navigateToAddMeasurement,
                                                         }) => {
  // Should not display the add button, if there is already an entry for today
  const hasButton = !!navigateToAddMeasurement && !moment()
    .startOf('day')
    .isBefore(moment(meter.lastMeasurements?.[0].date).endOf("day"))

  const AddButtonOffset = hasButton ? 16 : -8
  const styles = makeStyles(AddButtonOffset)

  const subTitle = useMemo(() => {
    if (!meter.lastMeasurements?.[0].date) {
      return t('meter:no_previous_reading')
    }

    const formattedLastMeasurementDate = moment(meter.lastMeasurements?.[0].date)
      .format('LL')
    return t('meter:last_reading', { date: formattedLastMeasurementDate })
  }, [meter.lastMeasurements])

  const percentileChange = useMemo(() => {
    if ((meter.lastMeasurements?.length ?? 0) < 3) {
      return 0
    }
    const date1 = moment(meter.lastMeasurements?.[0].date)
    const date2 = moment(meter.lastMeasurements?.[1].date)
    const date3 = moment(meter.lastMeasurements?.[2].date)
    const value1 = meter.lastMeasurements?.[0].value ?? 0
    const value2 = meter.lastMeasurements?.[1].value ?? 0
    const value3 = meter.lastMeasurements?.[2].value ?? 0

    const daysBetween1 = date1.endOf('day').diff(date2.startOf('day'), 'days') || 1
    const daysBetween2 = date2.endOf('day').diff(date3.startOf('day'), 'days') || 1

    const delta1 = (value1 - value2) / daysBetween1
    const delta2 = (value2 - value3) / daysBetween2

    return (delta1 - delta2) / Math.abs(delta2 || 1) * 100
  }, [meter])

  const areValuesGood = percentileChange !== undefined && ((percentileChange >= 0 && !!meter.areValuesDepleting) || (percentileChange <= 0 && !meter.areValuesDepleting))

  // TODO Add meter modal allow comma
  // TODO Contract, add yearly base price
  // TODO Contract, add unit conversion
  // TODO Add yearly stats
  // TODO Fix issue with contract last months price calucaltion

  return <>
    <Ripple
      style={ [styles.container] }
      rippleColor={ Colors.onSurface }
      onPress={ onPress }
    >
      <View
        style={ {
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'flex-start',
        } }
      >
        <Text
          style={ styles.title }
          onSurface
        >
          { meter.name }
        </Text>
        <Text
          style={ styles.subtitle }
          onSurface
        >
          { subTitle }
        </Text>
      </View>
      <Text
            style={ [styles.value, { color: areValuesGood ? Colors.tertiary : Colors.error }] }
        onSurface
      >
          { percentileChange > 0 && '+' }{ parseValueForDigits(percentileChange, 2) }%
      </Text>
    </Ripple>
    {
      hasButton &&
        <View
            style={ {
              display: 'flex',
              alignItems: 'flex-start',
            } }
        >
            <Button
                style={ {
                  marginHorizontal: 16,
                  marginTop: -(AddButtonOffset + 16),
                  marginBottom: 8,
                } }
                color='outline'
                isSmall
                label={ t('utils:add_entry') }
                icon={ AddIcon }
                onPress={ navigateToAddMeasurement }
            />
        </View>
    }
  </>
}

const makeStyles = (AddButtonOffset = 16) => StyleSheet.create({
  container: {
    flex: 1,
    height: 72 + AddButtonOffset,
    paddingBottom: 8 + AddButtonOffset,
    paddingTop: 8,
    paddingLeft: 16,
    paddingRight: 24,
    flexDirection: 'row',
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
