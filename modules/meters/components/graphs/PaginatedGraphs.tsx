import { TouchableOpacity, View } from 'react-native'
import { useRef } from 'react'
import Animated, {
  SharedValue,
  useAnimatedStyle,
  useSharedValue,
  interpolateColor,
  useHandler,
  useEvent,
} from 'react-native-reanimated'
import { UsagePerDay } from '@/modules/meters/components/graphs/UsagePerDay'
import {
  getAllReadingsForMeter,
  getYearlyUsagesForMeter,
} from '@/modules/readings/readings.query'
import { UsagePerYear } from '@/modules/meters/components/graphs/UsagePerYear'
import { useColors } from '@/modules/general/theme'
import PagerView from 'react-native-pager-view'

const AnimatedPagerView = Animated.createAnimatedComponent(PagerView)

export function PaginatedGraphs({
  readings,
  yearlyUsages,
}: {
  yearlyUsages: Awaited<ReturnType<typeof getYearlyUsagesForMeter>>
  readings: Awaited<ReturnType<typeof getAllReadingsForMeter>>
}) {
  // A number where the index of the selected graph is stored and where the decimal part is the progress of the scroll
  const indexWithProgress = useSharedValue(0)
  const pagerRef = useRef<PagerView>(null)

  const pageScrollHandler = usePageScrollHandler(
    {
      onPageScroll: (e) => {
        'worklet'
        const typedEvent = e as unknown as { offset: number; position: number }
        indexWithProgress.value = typedEvent.offset + typedEvent.position
      },
    },
    [],
  )

  return (
    <View>
      <AnimatedPagerView
        ref={pagerRef}
        style={{ height: 260 }}
        initialPage={indexWithProgress.value}
        onPageScroll={pageScrollHandler}
      >
        <View key="1">
          <UsagePerDay readings={readings} />
        </View>
        <View key="2">
          <UsagePerYear yearlyUsages={yearlyUsages} />
        </View>
      </AnimatedPagerView>
      <View
        style={{
          width: '100%',
          height: 24,
          paddingVertical: 8,
          gap: 16,
          flexDirection: 'row',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <PaginationDot
          indexWithProgress={indexWithProgress}
          index={0}
          onPress={() => pagerRef.current?.setPage(0)}
        />
        <PaginationDot
          indexWithProgress={indexWithProgress}
          index={1}
          onPress={() => pagerRef.current?.setPage(1)}
        />
      </View>
    </View>
  )
}

const PaginationDotSizeLarge = 8
const PaginationDotSizeSmall = 6
const PaginationDotSizeDifference =
  PaginationDotSizeLarge - PaginationDotSizeSmall
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
      progressIndex === index
        ? 1 - progress
        : progressIndex + 1 === index
          ? progress
          : 0
    const color = interpolateColor(
      colorProgress,
      [0, 1],
      [colors.textStatic, colors.text],
    )

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
      <Animated.View style={animatedStyle} />
    </TouchableOpacity>
  )
}

type HandlerParams = Parameters<typeof useHandler>

function usePageScrollHandler(
  handlers: HandlerParams[0],
  dependencies: HandlerParams[1],
) {
  const { context, doDependenciesDiffer } = useHandler(handlers, dependencies)
  const subscribeForEvents = ['onPageScroll']

  return useEvent(
    (event) => {
      'worklet'
      const { onPageScroll } = handlers
      if (onPageScroll && event.eventName.endsWith('onPageScroll')) {
        onPageScroll(event, context)
      }
    },
    subscribeForEvents,
    doDependenciesDiffer,
  )
}
