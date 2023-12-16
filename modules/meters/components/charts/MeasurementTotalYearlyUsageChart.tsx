import { t } from '@/i18n'
import { measurementsForSelectedMeterGroupedByMonth } from '@/measurements/measurement.signals'
import { selectedMeterSignal } from '@/meters/meters.signals'
import { useComputed, useSignal } from '@preact/signals-react'
import * as d3 from 'd3'
import React, { type FunctionComponent } from 'react'
import { Appearance } from 'react-native'
import Svg, { G, Line, Rect, Text as SvgText } from 'react-native-svg'
import { Colors, Text, View } from 'react-native-ui-lib'
import { ChartColorsDark, ChartColorsLight } from '../../../../setupTheme'

const ChartPadding = {
  top: 16,
  left: 32,
  bottom: 16,
  right: 16,
}

export const MeasurementTotalYearlyUsageChart: FunctionComponent = () => {
  const svgContainerWidth = useSignal(0)
  const svgContainerHeight = useComputed(() => svgContainerWidth.value * 0.6 + 12)

  const data = useComputed(() => {
    const selectedMeter = selectedMeterSignal.value
    if (
      !svgContainerWidth.value ||
      !measurementsForSelectedMeterGroupedByMonth.value.length ||
      !selectedMeter
    ) {
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
        const [, year] = monthYear.split(' ')

        if (!acc[year]) {
          acc[year] = 0
        }
        // We only want to show negative values if the meter is refillable and does not prefer positive values
        const refillableMultiplier = selectedMeter.areValuesDepleting ? -1 : 1
        const totalUsagePositive = measurements
          .map(({ difference }) => difference ?? 0)
          .filter((value) =>
            selectedMeter.isRefillable ? value * refillableMultiplier <= 0 : value >= 0
          )
          .reduce((acc, curr) => acc + curr, 0)

        acc[year] += totalUsagePositive

        return acc
      },
      {} as Record<string, number>
    )

    const PossibleColors =
      Appearance.getColorScheme() === 'dark' ? ChartColorsDark : ChartColorsLight

    const interpolator = d3.piecewise(d3.interpolateHcl, PossibleColors)
    const colorAmount = Math.max(2, Object.keys(barsPerYear).length)
    const colors = d3.quantize(interpolator, colorAmount)

    const colorScale = d3.scaleOrdinal().domain(Object.keys(barsPerYear)).range(colors)

    const [minValue = 0, maxValue = 0] = d3.extent(Object.values(barsPerYear))
    const yScale = d3
      .scaleLinear()
      .domain([Math.min(0, minValue), Math.max(0, maxValue)])
      .nice()
      .range([svgContainerHeight.value - ChartPadding.bottom, ChartPadding.top])
    const xScale = d3
      .scaleBand()
      .domain(Object.keys(barsPerYear).sort((a, b) => parseInt(b) - parseInt(a)))
      .range([ChartPadding.left, svgContainerWidth.value - ChartPadding.right])
      .padding(0.25)

    return {
      barsPerYear,
      yScale,
      xScale,
      colorScale,
    }
  })
  const { barsPerYear, yScale, xScale, colorScale } = data.value

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
            yScale.ticks(5).map((tick) => (
              <G translateY={yScale(tick)} key={tick}>
                <SvgText
                  x={ChartPadding.left - 2}
                  translateY={2}
                  textAnchor="end"
                  fontSize={8}
                  fontWeight={100}
                  strokeWidth={0.6}
                  opacity={0.8}
                  stroke={Colors.onSurface}
                >
                  {tick /*+ " " + route.params.meter.unit*/}
                </SvgText>
                <Line
                  x1={ChartPadding.left}
                  x2={svgContainerWidth.value - ChartPadding.right}
                  opacity={0.8}
                  stroke={Colors.onSurface}
                  strokeWidth={1}
                />
              </G>
            ))}
        </G>
        <G>
          {xScale &&
            Object.entries(barsPerYear).map(([label], i) => (
              <G translateX={xScale(label)} key={label + i}>
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
                  {label}
                </SvgText>
              </G>
            ))}
        </G>
        {colorScale &&
          Object.entries(barsPerYear).map(([year, value]) => (
            <G key={year}>
              <Rect
                x={xScale(year)}
                y={value >= 0 ? yScale(0) : yScale(value)}
                width={xScale.bandwidth()}
                height={value >= 0 ? yScale(value) - yScale(0) : yScale(0) - yScale(value)}
                fill={colorScale(year) ?? Colors.primary}
              />
            </G>
          ))}
      </Svg>
    </View>
  )
}
