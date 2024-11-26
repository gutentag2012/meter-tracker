import { Dimensions, FlatList, Text, TouchableOpacity, View } from 'react-native'
import { useColors } from '@/lib/constants/theme'
import { useMemo, useRef } from 'react'
import Animated, {
  SharedValue,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useSharedValue,
} from 'react-native-reanimated'
import { MotiView } from 'moti'
import { interpolateColor } from 'react-native-reanimated/src'
import { UsagePerDay } from '@/modules/meters/components/graphs/UsagePerDay'
import { getAllReadingsForMeter, getYearlyUsagesForMeter } from '@/modules/readings/readings.query'
import { UsagePerYear } from '@/modules/meters/components/graphs/UsagePerYear'
import { translate } from '@/lib/translations/i18n'

const width = Dimensions.get('window').width - 32

export function PaginatedGraphs({
  readings,
  yearlyUsages,
}: {
  yearlyUsages: Awaited<ReturnType<typeof getYearlyUsagesForMeter>>
  readings: Awaited<ReturnType<typeof getAllReadingsForMeter>>
}) {
  const colors = useColors()

  const graphs = useMemo(
    () => [
      { label: translate('meters.graphs.perDayTitle'), item: <UsagePerDay readings={readings} /> },
      {
        label: translate('meters.graphs.perYearTitle'),
        item: <UsagePerYear yearlyUsages={yearlyUsages} />,
      },
    ],
    [yearlyUsages, readings]
  )

  // A number where the index of the selected graph is stored and where the decimal part is the progress of the scroll
  const indexWithProgress = useSharedValue(0)
  const onScroll = useAnimatedScrollHandler((event) => {
    const { x } = event.contentOffset
    indexWithProgress.value = x / (width + 16)
  })

  const flatListRef = useRef<FlatList>(null)

  return (
    <View>
      <Animated.FlatList
        ref={flatListRef}
        data={graphs}
        style={{ minHeight: 0, marginHorizontal: -8 }}
        renderItem={({ item }) => (
          <View
            style={{
              width,
              minHeight: 0,
              backgroundColor: colors.card,
              borderRadius: 4,
              marginHorizontal: 8,
            }}>
            {item.item}
          </View>
        )}
        horizontal
        pagingEnabled
        keyExtractor={(item) => item.label}
        onScroll={onScroll}
        showsHorizontalScrollIndicator={false}
      />
      <View
        style={{
          width: '100%',
          height: 24,
          paddingVertical: 8,
          gap: 16,
          flexDirection: 'row',
          justifyContent: 'center',
          alignItems: 'center',
        }}>
        {graphs.map((_, index) => (
          <PaginationDot
            key={index}
            indexWithProgress={indexWithProgress}
            index={index}
            onPress={() => {
              flatListRef.current?.scrollToIndex({ index, animated: true })
            }}
          />
        ))}
      </View>
    </View>
  )
}

const PaginationDotSizeLarge = 8
const PaginationDotSizeSmall = 6
const PaginationDotSizeDifference = PaginationDotSizeLarge - PaginationDotSizeSmall
function PaginationDot({
  indexWithProgress,
  index,
  onPress,
}: {
  indexWithProgress: SharedValue<number>
  index: number
  onPress?: () => void
}) {
  const colors = useColors()
  const animatedStyle = useAnimatedStyle(() => {
    const progressRounded = Math.round(indexWithProgress.value * 1e6) / 1e6
    const progressIndex = Math.floor(progressRounded)
    const progress = progressRounded - progressIndex

    const width =
      progressIndex === index
        ? PaginationDotSizeLarge - PaginationDotSizeDifference * progress
        : progressIndex + 1 === index
          ? PaginationDotSizeSmall + PaginationDotSizeDifference * progress
          : PaginationDotSizeSmall

    const colorProgress =
      progressIndex === index ? 1 - progress : progressIndex + 1 === index ? progress : 0
    const color = interpolateColor(colorProgress, [0, 1], [colors.textStatic, colors.text])

    // noinspection JSSuspiciousNameCombination
    return {
      width: width,
      height: width,
      borderRadius: PaginationDotSizeLarge,
      backgroundColor: color,
    }
  })
  return (
    <TouchableOpacity onPress={onPress}>
      <MotiView style={animatedStyle} />
    </TouchableOpacity>
  )
}
