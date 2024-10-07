import { t } from '@/i18n'
import * as d3 from 'd3'
import moment from 'moment/moment'
import React, { type FunctionComponent } from 'react'
import { Appearance } from 'react-native'
import Svg, { G, Line, Path, Rect, Text as SvgText } from 'react-native-svg'
import { Colors, Text, View } from 'react-native-ui-lib'
import { ChartColorsDark, ChartColorsLight } from '../../../../setupTheme'
import { useComputed, useSignal } from '@preact/signals-react'
import {
  dailyUsagesForSelectedMeter,
  type DataEntry,
  selectedYear,
} from '@/measurements/measurement.signals'

const ChartPadding = {
  top: 16,
  left: 32,
  bottom: 16,
  right: 16,
}

export const YearlyChunkSize = 5

export const MeasurementDailyUsagePerDayChart: FunctionComponent = () => {
  const svgContainerWidth = useSignal(0)
  const svgContainerHeight = useComputed(() => svgContainerWidth.value * 0.6)

  const data = useComputed(() => {
    if (!svgContainerWidth.value || !dailyUsagesForSelectedMeter.value.length) {
      return {
        linesPerYear: {},
        yScale: undefined,
        mappedXScale: undefined,
        xScale: undefined,
        colorScale: undefined,
      }
    }

    const linesPerYear: Record<string, string> = {}
    const PossibleColors =
      Appearance.getColorScheme() === 'dark' ? ChartColorsDark : ChartColorsLight

    const interpolator = d3.piecewise(d3.interpolateHcl, PossibleColors)
    const colorAmount = Math.max(2, Object.keys(dailyUsagesForSelectedMeter.value).length)
    const colors = d3.quantize(interpolator, colorAmount)

    const colorScale = d3
      .scaleOrdinal()
      .domain(Object.keys(dailyUsagesForSelectedMeter.value))
      .range(colors)

    const allData = Object.values(dailyUsagesForSelectedMeter.value).flatMap(([, value]) => value)
    const [minValue = 0, maxValue = 0] = d3.extent(allData, (entry) => entry.value)
    const [minDate = Date.now(), maxDate = Date.now()] = d3.extent(allData, (entry) => entry.date)
    const yScale = d3
      .scaleLinear()
      .domain([minValue, maxValue])
      .nice()
      .range([svgContainerHeight.value - ChartPadding.bottom, ChartPadding.top])
    const xScale = d3
      .scaleTime()
      .domain([minDate, maxDate])
      .nice(1)
      .range([ChartPadding.left, svgContainerWidth.value - ChartPadding.right])

    for (const [year, data] of dailyUsagesForSelectedMeter.value) {
      linesPerYear[year] =
        d3
          .line<DataEntry>()
          .x((d) => xScale(d.date))
          .y((d) => yScale(d.value))
          .curve(d3.curveCardinal.tension(0.9))(data) ?? ''
    }

    const mappedXScale: Array<[number, string]> = xScale
      .ticks()
      .map((tick) => [moment(tick).valueOf(), moment(tick).format('MMM')])

    console.log('Finished computing chart data')

    return {
      linesPerYear,
      yScale,
      mappedXScale,
      xScale,
      colorScale,
    }
  })
  const { linesPerYear, yScale, mappedXScale, xScale, colorScale } = data.value

  const chunkedYears = Object.keys(linesPerYear).reduce(
    (acc, year, index) => {
      const chunkIndex = Math.floor(index / YearlyChunkSize)
      if (!acc[chunkIndex]) {
        acc[chunkIndex] = []
      }
      acc[chunkIndex].push(year)
      return acc
    },
    [] as Array<Array<string>>
  )

  return (
    <View
      style={{
        minHeight: svgContainerWidth.value * 0.6,
        height: svgContainerWidth.value * 0.6,
        marginBottom: 24 * chunkedYears.length,
        position: 'relative',
      }}
      onLayout={({ nativeEvent: { layout } }) => (svgContainerWidth.value = layout.width)}
    >
      {!chunkedYears.length && (
        <Text
          style={{
            textAlign: 'center',
            lineHeight: svgContainerWidth.value * 0.6,
          }}
        >
          {t('utils:no_data')}
        </Text>
      )}
      <Svg
        width={svgContainerWidth.value}
        height={svgContainerHeight.value + 24 * chunkedYears.length}
      >
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
          {mappedXScale &&
            xScale &&
            mappedXScale.map(([tick, label], i) => (
              <G translateX={xScale(tick)} key={label + i}>
                <SvgText
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
          chunkedYears.map((chunk, chunkIndex) => (
            <G
              key={`chunk-${chunkIndex}`}
              translateX={ChartPadding.left}
              translateY={chunkIndex * 24 + svgContainerHeight.value + 4}
            >
              {chunk.map((year, index) => (
                <G key={`legend-${year}-${index}`} translateX={index * 56}>
                  <Rect rx={2} width={8} height={8} fill={colorScale(year) ?? Colors.primary} />
                  <SvgText
                    fontWeight={400}
                    x={8 + 4}
                    y={8}
                    fill={Colors.onSurface}
                    opacity={selectedYear.value === year ? 1 : !selectedYear ? 0.8 : 0.6}
                  >
                    {year}
                  </SvgText>
                  <Rect
                    y={-4}
                    x={-4}
                    rx={2}
                    stroke={Colors.onSurface}
                    opacity={selectedYear.value === year ? 1 : !selectedYear ? 0.8 : 0.6}
                    width={48}
                    height={15}
                    onPress={() => (selectedYear.value = year === selectedYear.peek() ? '' : year)}
                  />
                </G>
              ))}
            </G>
          ))}
        {colorScale &&
          Object.entries(linesPerYear)
            .filter(([year]) => !selectedYear.value || year === selectedYear.value)
            .map(([year, line]) => (
              <G key={year}>
                <Path
                  d={line}
                  stroke={colorScale(year) ?? Colors.primary}
                  strokeWidth={2}
                  strokeLinecap="round"
                  fill="none"
                />
              </G>
            ))}
      </Svg>
    </View>
  )
}
