import { Dimensions, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import { CalendarIcon, DiffIcon, PlusIcon } from 'lucide-react-native'
import { formateDate } from '@/lib/translations/i18n'
import { isToday } from 'date-fns'
import { Link } from 'expo-router'
import { useColors, useDefaultStyles } from '@/lib/constants/theme'
import { useMemo } from 'react'
import { ChangeIndicatorIcon } from '@/lib/components/ChangeIndicatorIcon'
import Animated, {
  runOnJS,
  SharedValue,
  useAnimatedReaction,
  useAnimatedStyle,
  useSharedValue,
} from 'react-native-reanimated'
import { Gesture, GestureDetector } from 'react-native-gesture-handler'
import {
  cellHeight,
  cellWidth,
  getCellIndexFromPosition,
  getCellPositionFromIndex,
} from '@/modules/meters/meters.constants'

interface Props {
  meter: {
    meterId: number
    meterName: string | null
    meterUnit: string | null
    lastReading: number | null
    lastReadingDate: Date | null
    percentileChange: number | null
    lastDifferencePerDay: number | null
    meterPrecision: number | null
  }
  positions: SharedValue<Record<number, number>>
  onFinishSort?: () => void
}

export const MeterGridItem = ({ meter, positions, onFinishSort }: Props) => {
  const defaultStyles = useDefaultStyles()
  const colors = useColors()

  const styles = useMemo(
    () =>
      StyleSheet.create({
        meterContainer: {
          position: 'absolute',
          width: cellWidth,
          height: cellHeight,
          borderRadius: 6,
          backgroundColor: colors.card,
          padding: 8,
        },
        meterContainerInner: {
          flex: 1,
          justifyContent: 'space-between',
        },
      }),
    [colors]
  )

  const position = getCellPositionFromIndex(positions.value[meter.meterId])
  const translateX = useSharedValue(position.x)
  const translateY = useSharedValue(position.y)
  const prevTranslateX = useSharedValue(0)
  const prevTranslateY = useSharedValue(0)
  const isDragging = useSharedValue(false)

  const panGestureHandler = Gesture.Pan()
    .activateAfterLongPress(200)
    .onStart(() => {
      prevTranslateX.value = translateX.value
      prevTranslateY.value = translateY.value
      isDragging.value = true
    })
    .onChange((event) => {
      translateX.value = prevTranslateX.value + event.translationX
      translateY.value = prevTranslateY.value + event.translationY

      const oldIndex = positions.value[meter.meterId]
      const newIndex = getCellIndexFromPosition(translateX.value, translateY.value)
      const indexIncluded = Object.values(positions.value).includes(newIndex)
      if (newIndex === oldIndex || newIndex < 0 || !indexIncluded) {
        return
      }

      const keyOfNewIndex = (Object.keys(positions.value) as unknown as number[]).find(
        (key) => positions.value[key] === newIndex
      )
      if (!keyOfNewIndex) {
        return
      }

      const newPositions = { ...positions.value }
      newPositions[meter.meterId] = newIndex
      newPositions[keyOfNewIndex] = oldIndex
      positions.value = newPositions
    })
    .onEnd(() => {
      isDragging.value = false
      const position = getCellPositionFromIndex(positions.value[meter.meterId])
      translateX.value = position.x
      translateY.value = position.y

      if (onFinishSort) {
        runOnJS(onFinishSort)()
      }
    })

  useAnimatedReaction(
    () => positions.value[meter.meterId],
    (newIndex) => {
      const newPositions = getCellPositionFromIndex(newIndex)
      translateX.value = newPositions.x
      translateY.value = newPositions.y
    }
  )

  const animatedStyle = useAnimatedStyle(() => {
    return {
      zIndex: isDragging.value ? 1000 : 0,
      transform: [
        { translateX: translateX.value },
        { translateY: translateY.value },
        { scale: isDragging.value ? 1.1 : 1 },
      ],
    }
  })

  const changeColor =
    (meter.percentileChange ?? 0) > 0
      ? colors.negative
      : (meter.percentileChange ?? 0) < 0
        ? colors.positiv
        : colors.textMuted

  return (
    <Animated.View style={[styles.meterContainer, animatedStyle]}>
      <GestureDetector gesture={panGestureHandler}>
        <Animated.View style={{ flex: 1 }}>
          <Link key={meter.meterId} href={`/meter/${meter.meterId}` as any} asChild>
            <TouchableOpacity style={styles.meterContainerInner}>
              <View style={defaultStyles.row}>
                <Text style={[defaultStyles.cardTitle, { flex: 1 }]}>{meter.meterName}</Text>
                {!isNaN(meter.percentileChange ?? 0) && (
                  <View style={defaultStyles.iconText}>
                    <ChangeIndicatorIcon change={meter.percentileChange ?? 0} />
                    <Text
                      style={[
                        defaultStyles.detail,
                        {
                          color: changeColor,
                        },
                      ]}>
                      {(meter.percentileChange ?? 0).toFixed(2)} %
                    </Text>
                  </View>
                )}
              </View>

              <View style={[defaultStyles.row]}>
                <View>
                  {meter.lastDifferencePerDay !== null && (
                    <View style={defaultStyles.iconText}>
                      <DiffIcon size={defaultStyles.detail.fontSize} stroke={colors.textMuted} />
                      <Text style={defaultStyles.detail}>
                        {meter.lastDifferencePerDay?.toFixed(meter.meterPrecision ?? 2)}{' '}
                        {meter.meterUnit}
                      </Text>
                    </View>
                  )}
                  {meter.lastReadingDate && (
                    <View style={defaultStyles.iconText}>
                      <CalendarIcon
                        size={defaultStyles.detail.fontSize}
                        stroke={colors.textMuted}
                      />
                      <Text style={defaultStyles.detail}>
                        {formateDate(meter.lastReadingDate, 'PP')}
                      </Text>
                    </View>
                  )}
                </View>
                {(!meter.lastReadingDate || !isToday(meter.lastReadingDate)) && (
                  <TouchableOpacity style={[defaultStyles.fab, { marginLeft: 'auto' }]}>
                    <PlusIcon size={16} stroke={colors.onPrimaryContainer} />
                  </TouchableOpacity>
                )}
              </View>
            </TouchableOpacity>
          </Link>
        </Animated.View>
      </GestureDetector>
    </Animated.View>
  )
}
