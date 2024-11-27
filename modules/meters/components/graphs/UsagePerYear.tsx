import { Dimensions, Text, View } from 'react-native'
import { Canvas, useFont, Line, Rect } from '@shopify/react-native-skia'
import { useColors, useDefaultStyles } from '@/lib/constants/theme'
import { Fragment } from 'react'
import { getYearlyUsagesForMeter } from '@/modules/readings/readings.query'
import { AxisText } from '@/modules/meters/components/graphs/AxisText'
import { translate } from '@/lib/translations/i18n'
import { useUsagePerYearData } from '@/modules/meters/hooks/useUsagePerYearData'

const width = Dimensions.get('window').width - 32
const CHART_PADDING_X = 8
const CHART_PADDING_Y = 0
const CHART_FOOTER_HEIGHT = 16
const CHART_HEIGHT = 220
const TOTAL_CHART_HEIGHT = CHART_HEIGHT + CHART_FOOTER_HEIGHT

export function UsagePerYear({
  yearlyUsages,
}: {
  yearlyUsages: Awaited<ReturnType<typeof getYearlyUsagesForMeter>>
}) {
  const colors = useColors()
  const defaultStyles = useDefaultStyles()
  const font = useFont(require('@/assets/fonts/SpaceMono-Regular.ttf'), 12)
  const fontBold = useFont(require('@/assets/fonts/SpaceMono-Bold.ttf'), 12)
  const yearWidth = font && font.measureText('0000').width

  const unit = yearlyUsages?.[0]?.unitAbbreviation ?? ''

  const chartData = useUsagePerYearData(
    yearlyUsages,
    width,
    CHART_HEIGHT,
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
        <Text style={defaultStyles.detail}>{translate('meters.graphs.perYearTitle')}</Text>
        <Text style={defaultStyles.detailSmall}>({unit})</Text>
      </View>
      <Canvas
        style={{
          width,
          height: TOTAL_CHART_HEIGHT,
        }}>
        {font && !yearlyUsages.length && (
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
          chartData.xScale &&
          chartData.xScale.ticks(6).map((tick) => {
            const tickText = tick.toFixed(0)
            const fontSize = font.measureText(tickText)
            return (
              <Fragment key={tick}>
                <AxisText
                  x={chartData.xScale(tick)!}
                  y={CHART_HEIGHT - CHART_PADDING_Y}
                  text={tickText}
                  color={colors.textStatic}
                  font={font}
                  axis='x'
                />
                <Line
                  p1={{
                    x: chartData.xScale(tick)!,
                    y: CHART_HEIGHT - CHART_PADDING_Y - fontSize.height - 4,
                  }}
                  p2={{
                    x: chartData.xScale(tick)!,
                    y: CHART_PADDING_Y,
                  }}
                  color={colors.textStatic}
                  strokeWidth={0.5}
                  strokeCap='round'
                />
              </Fragment>
            )
          })}
        {font &&
          chartData.xScale &&
          chartData.yScale &&
          yearlyUsages?.map(({ year }) => {
            const yearText = `${year}`
            return (
              <AxisText
                key={yearText}
                x={CHART_PADDING_X}
                y={chartData.yScale!(yearText)! + chartData.yScale.bandwidth() / 2}
                text={yearText}
                color={colors.textStatic}
                font={font}
                axis='y'
              />
            )
          })}
        {fontBold &&
          chartData.yScale &&
          chartData.xScale &&
          yearlyUsages?.map(({ year, usage }) => {
            const start = chartData.xScale(0)
            const end = chartData.xScale(usage)
            const barWidth = end - start
            const usageText = usage.toFixed(2)
            const fontSize = fontBold.measureText(usageText)
            const labelXPos = Math.max(
              CHART_PADDING_X + (yearWidth ?? 0) + 16,
              Math.min(end + 8, width - fontSize.width - CHART_PADDING_X - 8)
            )
            return (
              <Fragment key={year}>
                <Rect
                  width={barWidth}
                  height={chartData.yScale.bandwidth()}
                  rect={{
                    width: barWidth,
                    height: chartData.yScale.bandwidth(),
                    x: start,
                    y: chartData.yScale(`${year}`)!,
                  }}
                  color={chartData.colorScale(`${year}`) as string}
                />
                <AxisText
                  x={labelXPos}
                  y={chartData.yScale(`${year}`)! + chartData.yScale.bandwidth() / 2}
                  text={usageText}
                  color={
                    labelXPos < end - fontSize.width && labelXPos > start
                      ? colors.background
                      : colors.text
                  } // TODO Improve contrast
                  font={fontBold}
                  axis='y'
                />
              </Fragment>
            )
          })}
      </Canvas>
    </View>
  )
}
