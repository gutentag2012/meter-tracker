import * as d3 from 'd3'
import moment from 'moment/moment'
import React, { type FunctionComponent, useMemo } from 'react'
import { Appearance, Dimensions } from 'react-native'
import Svg, { G, Line, Path, Rect, Text as SvgText } from 'react-native-svg'
import { Colors, View } from 'react-native-ui-lib'
import { type ClusteredMeasurements } from '../../../screens/MeterSummaryScreen'
import { ChartColorsDark, ChartColorsLight } from '../../../setupTheme'

const ChartPadding = {
  top: 16,
  left: 32,
  bottom: 16,
  right: 16,
}

interface MeasurementYearlyChartProps {
  measurements: ClusteredMeasurements
  isRefillable?: boolean
  areValuesDepleting?: boolean
}

type Props = MeasurementYearlyChartProps

export const YearlyChunkSize = 5

export const MeasurementDailyUsagePerDayChart: FunctionComponent<Props> = ({
  measurements,
  isRefillable,
  areValuesDepleting,
}) => {
  const svgContainerWidth = Dimensions.get('window').width
  const svgContainerHeight = svgContainerWidth * 0.6

  const { linesPerYear, yScale, mappedXScale, xScale, colorScale } = useMemo(() => {
    if (!svgContainerWidth || !measurements.length) {
      return {
        linesPerYear: {},
        yScale: undefined,
        mappedXScale: undefined,
        xScale: undefined,
        colorScale: undefined,
      }
    }
    type DataEntry = { value: number; date: number }
    const linesPerYear: Record<string, string> = {}

    const dataGrouped: Record<string, Array<DataEntry>> = Object.fromEntries(
      measurements.map(([year, measurements]) => [
        year,
        measurements
          .filter((m) => m.filter(Boolean).length >= 2)
          .map(([measurement, previousMeasurement, previousPreviousMeasurement]) => {
            const date = moment(measurement.createdAt).year(0).valueOf()

            // If the previous measurement is 0 and the one before that is 0, we assume that the meter got its first value
            if (!previousMeasurement?.value && !previousPreviousMeasurement?.value) {
              return {
                value: 0,
                date,
              }
            }

            const daysBetween =
              moment(measurement.createdAt)
                .endOf('day')
                .diff(moment(previousMeasurement.createdAt).startOf('day'), 'days') || 1
            const delta = measurement.value - previousMeasurement.value
            const value = delta / daysBetween

            if (
              isRefillable &&
              ((areValuesDepleting && value < 0) || (!areValuesDepleting && value > 0))
            ) {
              return {
                value: 0,
                date,
              }
            }

            return {
              value,
              date,
            }
          }),
      ])
    )

    const PossibleColors =
      Appearance.getColorScheme() === 'dark' ? ChartColorsDark : ChartColorsLight

    const interpolator = d3.piecewise(d3.interpolateHcl, PossibleColors)
    const colorAmount = Math.max(2, Object.keys(dataGrouped).length)
    const colors = d3.quantize(interpolator, colorAmount)

    const colorScale = d3.scaleOrdinal().domain(Object.keys(dataGrouped)).range(colors)

    const allData = Object.values(dataGrouped).flat()
    const [minValue = 0, maxValue = 0] = d3.extent(allData, (entry: DataEntry) => entry.value)
    const [minDate = Date.now(), maxDate = Date.now()] = d3.extent(
      allData,
      (entry: DataEntry) => entry.date
    )
    const yScale = d3
      .scaleLinear()
      .domain([minValue, maxValue])
      .nice()
      .range([svgContainerHeight - ChartPadding.bottom, ChartPadding.top])
    const xScale = d3
      .scaleTime()
      .domain([minDate, maxDate])
      .nice(1)
      .range([ChartPadding.left, svgContainerWidth - ChartPadding.right])

    for (const [year, data] of Object.entries(dataGrouped)) {
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

    return {
      linesPerYear,
      yScale,
      mappedXScale,
      xScale,
      colorScale,
    }
  }, [measurements, svgContainerWidth, areValuesDepleting, isRefillable])

  // const left = useSharedValue(0)
  // const top = useSharedValue(0)
  // const popupStyle = useAnimatedStyle(() => ({
  //   top: top.value,
  //   left: left.value,
  // }))

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
        minHeight: svgContainerWidth * 0.6,
        height: svgContainerWidth * 0.6,
        marginBottom: 24 * chunkedYears.length,
        position: 'relative',
      }}
    >
      <Svg width={svgContainerWidth} height={svgContainerHeight + 24 * chunkedYears.length}>
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
                  x2={svgContainerWidth - ChartPadding.right}
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
                  y={svgContainerHeight - ChartPadding.bottom + 10}
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
              translateY={chunkIndex * 24 + svgContainerHeight + 4}
            >
              {chunk.map((year, index) => (
                <G key={`legend-${year}-${index}`} translateX={index * 56}>
                  <Rect rx={2} width={8} height={8} fill={colorScale(year) ?? Colors.primary} />
                  <SvgText fontWeight={400} x={8 + 4} y={8} fill={Colors.onSurface} opacity={0.8}>
                    {year}
                  </SvgText>
                </G>
              ))}
            </G>
          ))}
        {colorScale &&
          Object.entries(linesPerYear).map(([year, line]) => (
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
