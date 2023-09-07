import moment from 'moment'
import React, { FunctionComponent, useMemo } from 'react'
import { StyleSheet } from 'react-native'
import { PanGestureHandler } from 'react-native-gesture-handler'
import Ripple from 'react-native-material-ripple'
import Animated, {
  runOnJS,
  useAnimatedGestureHandler,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated'
import { Avatar, Colors, Text, View } from 'react-native-ui-lib'
import Layout from '../../constants/Layout'
import Measurement from '../../services/database/entities/measurement'
import { t } from '../../services/i18n'
import { ThemeColors, Typography } from '../../setupTheme'
import { parseValueForDigits } from '../../utils/TranslationUtils'
import { DeleteIcon } from '../icons/DeleteIcon'

interface MeasurementListEntryProps {
  previousPreviousMeasurement?: Measurement
  previousMeasurement?: Measurement
  measurement: Measurement
  onPress?: () => void
  onDelete?: () => void
}

type Props = MeasurementListEntryProps

export const MeasurementListEntry: FunctionComponent<Props> = React.memo(({
                                                                            measurement,
                                                                            previousMeasurement,
                                                                            previousPreviousMeasurement,
                                                                            onPress,
                                                                            onDelete,
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
      .endOf('day')
      .diff(moment(previousMeasurement.createdAt)
        .startOf('day'), 'days') || 1
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
      return 0
    }

    const previousDaysBetween = moment(previousMeasurement.createdAt)
      .endOf('day')
      .diff(moment(previousPreviousMeasurement.createdAt)
        .startOf('day'), 'days') || 1
    const previousDelta = previousMeasurement.value - previousPreviousMeasurement.value
    const previousDeltaValue = previousDelta / previousDaysBetween

    return (deltaValue - previousDeltaValue) / Math.abs(previousDeltaValue || 1) * 100
  }, [deltaValue, previousMeasurement, previousPreviousMeasurement])

  const refillableMultiplier = measurement.meter?.isRefillable ? -1 : 1
  const areValuesGood = percentileChange !== undefined && (measurement.meter?.areValuesDepleting ? (percentileChange * refillableMultiplier) >= 0 : (percentileChange * refillableMultiplier) <= 0)

  // Animation (Swipe to delete)
  const dragX = useSharedValue(0)
  const height = useSharedValue(72)
  const opacity = useSharedValue(1)
  const gestureHandler = useAnimatedGestureHandler({
    onActive: (e) => {
      dragX.value = Math.min(0, e.translationX)
    },
    onEnd: (e) => {
      // Was not enough to remove
      if (e.translationX >= -100) {
        dragX.value = withTiming(0)
        return
      }

      dragX.value = withTiming(-Layout.window.width)
      height.value = withTiming(0)
      opacity.value = withTiming(0)
      if (onDelete) {
        runOnJS(onDelete)()
      }
    },
  })
  const itemContainerStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: dragX.value }],
    height: height.value,
    opacity: opacity.value,
  }))
  const backdropContainerStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: -dragX.value }],
    width: -dragX.value,
  }))

  return <PanGestureHandler
    onGestureEvent={ gestureHandler }
    activeOffsetX={ -10 }
  >
    <Animated.View style={ [itemContainerStyle, { position: 'relative' }] }>
      <Ripple
        // @ts-ignore
        style={ styles.container }
        rippleColor={ Colors.onSurface }
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
            { parseValueForDigits(measurement.value, measurement.meter?.digits) } { measurement.meter?.unit }
          </Text>
          { deltaValue !== undefined && <Text
              style={ styles.subtitle }
              onSurface
          >
            { parseValueForDigits(deltaValue, measurement.meter?.digits) } { measurement.meter?.unit } { t(
            'utils:per_day') }
          </Text> }
          { deltaPrice !== undefined && <Text
              style={ styles.subtitle }
              onSurface
          >
            { parseValueForDigits(deltaPrice, 2) } € { t('utils:per_day') }
          </Text> }
        </View>
        { percentileChange !== undefined && <Text
            style={ [styles.value, { color: areValuesGood ? Colors.tertiary : Colors.error }] }
            onSurface
        >
          { percentileChange > 0 && '+' }{ parseValueForDigits(percentileChange, 2) }%
        </Text> }
      </Ripple>
      <Animated.View
        style={ [
          {
            position: 'absolute',
            top: 0,
            right: 0,
            height: '100%',
            backgroundColor: Colors.errorContainer,
          }, backdropContainerStyle,
        ] }
      >
        <View
          style={ {
            marginLeft: 'auto',
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginRight: 16,
          } }
        >
          <DeleteIcon color={ Colors.onErrorContainer } />
        </View>
      </Animated.View>
    </Animated.View>
  </PanGestureHandler>
})

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingVertical: 12,
    paddingLeft: 16,
    paddingRight: 24,
    flexDirection: 'row' as const,
    height: '100%',
  },
  title: {
    ...Typography.LabelLarge,
    marginBottom: 2,
  },
  subtitle: {
    ...Typography.LabelSmall,
  },
  value: {
    marginLeft: 'auto',
    ...Typography.LabelSmall,
  },
})
