import { Dimensions, Text, View } from 'react-native'
import { Canvas, Path, useFont, Line, Rect } from '@shopify/react-native-skia'
import { useColors, useDefaultStyles } from '@/lib/constants/theme'
import { useSharedValue, withTiming } from 'react-native-reanimated'
import { Fragment, useEffect, useMemo } from 'react'
import { getAllReadingsForMeter, useReadingsForMeter } from '@/modules/readings/readings.query'
import { AxisText } from '@/modules/meters/components/graphs/AxisText'
import { useUsagePerDayData } from '@/modules/meters/hooks/useUsagePerDayData'
import { formatDate, translate } from '@/lib/translations/i18n'

const width = Dimensions.get('window').width - 32
const CHART_PADDING_X = 16
const CHART_PADDING_Y = 8
const CHART_FOOTER_HEIGHT = 48
const CHART_HEIGHT = 188
const TOTAL_CHART_HEIGHT = CHART_HEIGHT + CHART_FOOTER_HEIGHT
const allMonths = Array.from({ length: 12 }, (_, i) => new Date(1970, i, 15)).map(
  (tick) => [tick, formatDate(tick, 'MMM')] as const
)

export function UsagePerDay({
  readings,
}: {
  readings: Awaited<ReturnType<typeof getAllReadingsForMeter>>
}) {
  const colors = useColors()
  const defaultStyles = useDefaultStyles()
  const font = useFont(require('@/assets/fonts/SpaceMono-Regular.ttf'), 12)

  const animationLine = useSharedValue(1)
  useEffect(() => {
    animationLine.value = withTiming(0, { duration: 1000 })
  }, [animationLine])

  const unit = readings?.[0]?.unitAbbreviation ?? ''

  const years = useMemo(() => {
    return [
      ...readings
        .filter((r) => r.differencePerDay !== null)
        .reduce((acc, reading) => {
          const year = reading.readingTimestamp.getFullYear().toString()
          acc.add(year)
          return acc
        }, new Set<string>()),
    ].toReversed()
  }, [readings])
  const maxYOffset = Math.max(
    ...years.map((_, index) =>
      Math.floor((CHART_PADDING_X + index * 52) / (width - CHART_PADDING_X * 2))
    )
  )
  const yOffset = maxYOffset * 16

  const chartData = useUsagePerDayData(
    readings,
    width,
    CHART_HEIGHT - yOffset,
    CHART_PADDING_X,
    CHART_PADDING_Y
  )

  return (
    <View>
      <View
        style={[
          defaultStyles.row,
          { marginLeft: 8, marginTop: 8, marginBottom: 4, alignItems: 'flex-end', gap: 4 },
        ]}>
        <Text style={defaultStyles.detail}>{translate('meters.graphs.perDayTitle')}</Text>
        <Text style={defaultStyles.detailSmall}>
          ({unit}
          {translate('general.perDay')})
        </Text>
      </View>
      <Canvas
        style={{
          width,
          height: TOTAL_CHART_HEIGHT,
        }}>
        {font && !readings.length && (
          <AxisText
            x={width / 2}
            y={TOTAL_CHART_HEIGHT / 2}
            text={translate('meters.graphs.noData')}
            color={colors.textMuted}
            font={font}
            axis='x'
          />
        )}
        {font &&
          chartData.yScale &&
          chartData.yScale.ticks(6).map((tick) => {
            const tickText = tick.toFixed(1)
            const fontSize = font.measureText(tickText)
            return (
              <Fragment key={tick}>
                <AxisText
                  x={CHART_PADDING_X - 8}
                  y={chartData.yScale(tick)!}
                  text={tickText}
                  color={colors.textStatic}
                  font={font}
                  axis='y'
                />
                <Line
                  p1={{
                    x: CHART_PADDING_X + fontSize.width,
                    y: chartData.yScale(tick)!,
                  }}
                  p2={{
                    x: width - CHART_PADDING_X,
                    y: chartData.yScale(tick)!,
                  }}
                  color={colors.textStatic}
                  strokeWidth={0.5}
                  strokeCap='round'
                />
              </Fragment>
            )
          })}
        {font &&
          allMonths?.map(([tick, label], index) => {
            const fontSize = font.measureText(label)
            return (
              <AxisText
                key={label}
                x={chartData.xScale!(tick)!}
                y={
                  CHART_HEIGHT -
                  CHART_PADDING_Y +
                  fontSize.height +
                  8 +
                  (index % 2 === 1 ? 12 : 0) -
                  yOffset
                }
                text={label}
                color={colors.textStatic}
                font={font}
                axis='x'
              />
            )
          })}
        {chartData.colorScale &&
          chartData.linesPerYear &&
          Object.entries(chartData.linesPerYear).map(([year, linePath]) => (
            <Path
              key={year}
              path={linePath!}
              style='stroke'
              strokeWidth={2}
              color={(chartData.colorScale(year) as string) ?? colors.text}
              strokeCap='round'
              start={animationLine}
            />
          ))}
        {font &&
          chartData.colorScale &&
          years.toReversed().map((year, index) => {
            const xRaw = CHART_PADDING_X + index * 52
            const yOffsetLocal = Math.floor(xRaw / (width - CHART_PADDING_X * 2))
            const x = xRaw % (width - CHART_PADDING_X)
            return (
              <Fragment key={year}>
                <Rect
                  width={8}
                  height={8}
                  rect={{
                    x: x - 12 + CHART_PADDING_X / 2,
                    y: CHART_HEIGHT - CHART_PADDING_Y + 36 + yOffsetLocal * 16 - yOffset,
                    width: 8,
                    height: 8,
                  }}
                  color={chartData.colorScale(year) as string}
                />
                <AxisText
                  x={x + 16 + CHART_PADDING_X / 2}
                  y={CHART_HEIGHT - CHART_PADDING_Y + 36 + 8 + yOffsetLocal * 16 - yOffset}
                  text={year}
                  color={colors.textStatic}
                  font={font}
                  axis='x'
                />
              </Fragment>
            )
          })}
      </Canvas>
    </View>
  )
}
