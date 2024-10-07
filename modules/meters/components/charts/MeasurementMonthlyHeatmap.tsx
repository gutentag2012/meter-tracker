import { t } from '@/i18n'
import { measurementsForSelectedMeterGroupedByMonth } from '@/measurements/measurement.signals'
import { useComputed, useSignal } from '@preact/signals-react'
import * as d3 from 'd3'
import moment from 'moment'
import React, { type FunctionComponent } from 'react'
import { Appearance } from 'react-native'
import Svg, { G, Rect, Text as SvgText } from 'react-native-svg'
import { Colors, Text, View } from 'react-native-ui-lib'
import { ChartColorsDark, ChartColorsLight } from '../../../../setupTheme'

const ChartPadding = {
  top: 16,
  left: 32,
  bottom: 16,
  right: 16,
}

const padding = 1.125

export const MeasurementMonthlyHeatmap: FunctionComponent = () => {
  const svgContainerWidth = useSignal(0)
  const svgContainerHeight = useComputed(() => svgContainerWidth.value * 0.6 + 12)

  const data = useComputed(() => {
    if (!svgContainerWidth.value || !measurementsForSelectedMeterGroupedByMonth.value.length) {
      return {
        barsPerYear: {},
        months: [],
        yScale: undefined,
        mappedXScale: undefined,
        xScale: undefined,
        colorScale: undefined,
      }
    }

    const barsPerYear = measurementsForSelectedMeterGroupedByMonth.value.reduce(
      (acc, [monthYear, measurements]) => {
        const [monthName, year] = monthYear.split(' ')

        const month = moment().month(monthName).format('MMMM')

        const differencesPerMonth = measurements.reduce((acc, curr) => {
          // If the previous measurement is 0 and the one before that is 0, we assume that the meter got its first value
          if (!curr.prevDifference && !curr.difference) {
            return acc
          }

          return acc + (curr.difference ?? 0)
        }, 0)

        if (!acc[year]) {
          acc[year] = []
        }
        acc[year].push([month, differencesPerMonth / measurements.length])

        return acc
      },
      {} as Record<string, Array<[string, number]>>
    )
    const months = moment.months()

    const PossibleColors =
      Appearance.getColorScheme() === 'dark' ? ChartColorsDark : ChartColorsLight
    const baselineColor = `${PossibleColors[0]}80`
    const extremeColor = PossibleColors[4]

    const [minValue = 0, maxValue = 0] = d3.extent(
      Object.values(barsPerYear).flatMap((values) => values.flatMap(([, value]) => value))
    )

    const colorScale = d3
      .scaleLinear<string>()
      .domain([minValue, maxValue])
      .range(maxValue <= 0 ? [extremeColor, baselineColor] : [baselineColor, extremeColor])

    const yScale = d3
      .scaleBand()
      .domain(Object.keys(barsPerYear))
      .range([svgContainerHeight.value - ChartPadding.bottom, ChartPadding.top])
      .padding(padding - 1)

    const xScale = d3
      .scaleBand()
      .domain(months)
      .range([ChartPadding.left, svgContainerWidth.value - ChartPadding.right])
      .padding(padding - 1)

    return {
      barsPerYear,
      months,
      yScale,
      xScale,
      colorScale,
    }
  })
  const { barsPerYear, months, yScale, xScale, colorScale } = data.value

  return (
    <View
      style={{
        minHeight: svgContainerWidth.value * 0.6,
        height: svgContainerWidth.value * 0.6,
        position: 'relative',
      }}
      onLayout={({ nativeEvent: { layout } }) => (svgContainerWidth.value = layout.width)}
    >
      {!Object.keys(barsPerYear).length && (
        <Text
          style={{
            textAlign: 'center',
            lineHeight: svgContainerWidth.value * 0.6,
          }}
        >
          {t('utils:no_data')}
        </Text>
      )}
      <Svg width={svgContainerWidth.value} height={svgContainerHeight.value}>
        <G>
          {yScale &&
            Object.keys(barsPerYear).map((year) => {
              return (
                <G translateY={yScale(year)} key={year}>
                  <SvgText
                    y={yScale.bandwidth() / 2}
                    x={ChartPadding.left - 2}
                    textAnchor="end"
                    fontSize={8}
                    fontWeight={100}
                    strokeWidth={0.6}
                    opacity={0.8}
                    stroke={Colors.onSurface}
                  >
                    {year}
                  </SvgText>
                </G>
              )
            })}
        </G>
        <G>
          {xScale &&
            months.map((month, index) => (
              <G translateX={xScale(month)} translateY={index % 2 === 0 ? 4 : -6} key={month}>
                <SvgText
                  x={xScale.bandwidth() / 2}
                  y={svgContainerHeight.value - ChartPadding.bottom + 10}
                  textAnchor="middle"
                  fontSize={8}
                  fontWeight={100}
                  strokeWidth={0.6}
                  opacity={0.8}
                  stroke={Colors.onSurface}
                >
                  {month}
                </SvgText>
              </G>
            ))}
        </G>
        {colorScale &&
          xScale &&
          yScale &&
          Object.entries(barsPerYear).map(([year, months]) => (
            <G key={year} translateY={yScale(year)}>
              {months.map(([month, value]) => (
                <G key={month} translateX={xScale(month)}>
                  <Rect
                    x={0}
                    y={0}
                    rx={2}
                    ry={2}
                    width={xScale.bandwidth()}
                    height={yScale.bandwidth()}
                    fill={colorScale(value) ?? Colors.primary}
                  />
                </G>
              ))}
            </G>
          ))}
      </Svg>
    </View>
  )
}
