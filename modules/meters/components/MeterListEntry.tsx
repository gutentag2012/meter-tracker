import { type DetailedMeterWithValueSummary } from '@/meters/meters.selector'
import moment from 'moment'
import React, { type FunctionComponent, useMemo } from 'react'
import { StyleSheet } from 'react-native'
import Ripple from 'react-native-material-ripple'
import { Colors, Text, View } from 'react-native-ui-lib'
import { t } from '@/i18n'
import { Typography } from '../../../setupTheme'
import { parseValueForDigits } from '@utils/TranslationUtils'
import { Button } from '../../../components/Button'
import { AddIcon } from '../../../components/icons/AddIcon'

type LongEvent = {
  pageY: number
}

interface MeterListEntryProps {
  meter: DetailedMeterWithValueSummary
  onPress?: () => void
  navigateToAddMeasurement?: () => void
}

type Props = MeterListEntryProps

export const MeterListEntry: FunctionComponent<Props> = ({
  meter,
  onPress,
  navigateToAddMeasurement,
}) => {
  // Should not display the add button, if there is already an entry for today
  const hasButton =
    !!navigateToAddMeasurement &&
    !moment().startOf('day').isBefore(moment(meter.lastMeasurementDate).endOf('day'))

  const AddButtonOffset = hasButton ? 16 : -8
  const styles = makeStyles(AddButtonOffset)

  const subTitle = useMemo(() => {
    if (!meter.lastMeasurementDate) {
      return t('meter:no_previous_reading')
    }

    const formattedLastMeasurementDate = moment(meter.lastMeasurementDate).format('LL')
    return t('meter:last_reading', { date: formattedLastMeasurementDate })
  }, [meter.lastMeasurementDate])

  const percentileChange = useMemo(() => {
    if (
      meter.prevDifference === null ||
      meter.difference === null ||
      meter.daysBetween === null ||
      meter.prevDaysBetween === null
    ) {
      return 0
    }
    const delta1 = meter.difference / (meter.daysBetween || 1)
    const delta2 = meter.prevDifference / (meter.prevDaysBetween || 1)

    return ((delta1 - delta2) / Math.abs(delta2 || 1)) * 100
  }, [meter])

  const areValuesGood =
    percentileChange !== undefined &&
    ((percentileChange >= 0 && !!meter.areValuesDepleting) ||
      (percentileChange <= 0 && !meter.areValuesDepleting))

  return (
    <>
      <Ripple style={[styles.container]} rippleColor={Colors.onSurface} onPress={onPress}>
        <View
          style={{
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'flex-start',
          }}
        >
          <Text style={styles.title} onSurface>
            {meter.name}
          </Text>
          <Text style={styles.subtitle} onSurface>
            {subTitle}
          </Text>
        </View>
        <Text
          style={[styles.value, { color: areValuesGood ? Colors.tertiary : Colors.error }]}
          onSurface
        >
          {percentileChange > 0 && '+'}
          {parseValueForDigits(percentileChange, 2)}%
        </Text>
      </Ripple>
      {hasButton && (
        <View
          style={{
            display: 'flex',
            alignItems: 'flex-start',
          }}
        >
          <Button
            style={{
              marginHorizontal: 16,
              marginTop: -(AddButtonOffset + 16),
              marginBottom: 8,
            }}
            color="outline"
            isSmall
            label={t('utils:add_entry')}
            icon={AddIcon}
            onPress={navigateToAddMeasurement}
          />
        </View>
      )}
    </>
  )
}

const makeStyles = (AddButtonOffset = 16) =>
  StyleSheet.create({
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
