import { StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import { CalendarIcon, DiffIcon, PlusIcon } from 'lucide-react-native'
import { isToday } from 'date-fns'
import { Link } from 'expo-router'
import { useMemo } from 'react'
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
import { ChangeIndicatorIcon } from '@/modules/general/components'
import { useColors, useDefaultStyles } from '@/modules/general/theme'
import {
  formatDate,
  formatNumber,
  translate,
} from '@/modules/general/translations'
import {getAllMetersForBuilding} from "@/modules/meters";

interface Props {
  meter: Awaited<ReturnType<typeof getAllMetersForBuilding>>[number]
  positions: SharedValue<Record<number, number>>
  onFinishSort?: () => void
}

export const MeterGridItem = ({ meter, positions, onFinishSort }: Props) => {
  const colors = useColors()
  const defaultStyles = useDefaultStyles()

  const styles = useMemo(
    () =>
      StyleSheet.create({
        meterContainer: {
          position: 'absolute',
          width: cellWidth,
          height: cellHeight,
          borderRadius: 4,
          backgroundColor: colors.card,
          padding: 8,
        },
        meterContainerInner: {
          flex: 1,
        },
      }),
    [colors],
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
      const newIndex = getCellIndexFromPosition(
        translateX.value,
        translateY.value,
      )
      const indexIncluded = Object.values(positions.value).includes(newIndex)
      if (newIndex === oldIndex || newIndex < 0 || !indexIncluded) {
        return
      }

      const keyOfNewIndex = (
        Object.keys(positions.value) as unknown as number[]
      ).find((key) => positions.value[key] === newIndex)
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
    },
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
        ? colors.positive
        : colors.textMuted

  const hasLongTitle = (meter.meterName?.length ?? 0) > 9

  return (
    <Animated.View style={[styles.meterContainer, animatedStyle]}>
      <GestureDetector gesture={panGestureHandler}>
        <Animated.View style={{ flex: 1 }}>
          <Link
            key={meter.meterId}
            href={`/meter/${meter.meterId}` as any}
            asChild
          >
            <TouchableOpacity style={styles.meterContainerInner}>
              {hasLongTitle && (
                <Text style={[defaultStyles.cardTitle, { marginBottom: 0 }]}>
                  {meter.meterName}
                </Text>
              )}
              <View style={[defaultStyles.row, { alignItems: 'flex-start' }]}>
                <View style={{ flex: 1 }}>
                  {!hasLongTitle && (
                    <Text
                      style={[defaultStyles.cardTitle, { marginBottom: 0 }]}
                    >
                      {meter.meterName}
                    </Text>
                  )}
                  {meter.identifier && (
                    <Text style={[defaultStyles.detailSmall]}>
                      {meter.identifier}
                    </Text>
                  )}
                </View>
                {!isNaN(meter.percentileChange ?? 0) && (
                  <View style={defaultStyles.iconText}>
                    <ChangeIndicatorIcon change={meter.percentileChange ?? 0} />
                    <Text
                      style={[
                        defaultStyles.detail,
                        {
                          color: changeColor,
                        },
                      ]}
                    >
                      {formatNumber(
                        meter.percentileChange ?? 0,
                        meter.meterPrecision,
                      )}{' '}
                      %
                    </Text>
                  </View>
                )}
              </View>

              <View style={[defaultStyles.row, { marginTop: 'auto' }]}>
                <View>
                  {meter.lastDifferencePerDay !== null && (
                    <View style={defaultStyles.iconText}>
                      <DiffIcon
                        size={defaultStyles.detail.fontSize}
                        stroke={colors.textMuted}
                      />
                      <Text style={defaultStyles.detail}>
                        {formatNumber(
                          meter.lastDifferencePerDay,
                          meter.meterPrecision,
                        )}{' '}
                        <Text style={defaultStyles.detailSmall}>
                          {meter.meterUnit}
                          {translate('general.perDay')}
                        </Text>
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
                        {formatDate(meter.lastReadingDate, 'PP')}
                      </Text>
                    </View>
                  )}
                </View>
                {(!meter.lastReadingDate ||
                  !isToday(meter.lastReadingDate)) && (
                  <Link
                    href={`/meter/${meter.meterId}/reading`}
                    asChild
                    style={[defaultStyles.fab, { marginLeft: 'auto' }]}
                  >
                    <TouchableOpacity>
                      <PlusIcon size={16} stroke={colors.onPrimaryContainer} />
                    </TouchableOpacity>
                  </Link>
                )}
              </View>
            </TouchableOpacity>
          </Link>
        </Animated.View>
      </GestureDetector>
    </Animated.View>
  )
}
