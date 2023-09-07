import * as d3 from 'd3'
import moment from 'moment/moment'
import React, { FunctionComponent, useMemo, useState } from 'react'
import { Appearance } from 'react-native'
import Svg, { G, Line, Rect, Text as SvgText } from 'react-native-svg'
import { Colors, View } from 'react-native-ui-lib'
import { ClusteredMeasurements, MeasurementHistory } from '../../screens/MeterSummaryScreen'
import { ChartColorsDark, ChartColorsLight } from '../../setupTheme'

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

// TODO Show bars on top for positive and on bottom for negative (only if applicable)

export const MeasurementTotalYearlyUsageChart: FunctionComponent<Props> = ({ measurements, isRefillable, areValuesDepleting }) => {
  const [svgContainerWidth, setSvgContainerWidth] = useState(0)
  const svgContainerHeight = svgContainerWidth * .6 + 12

  const {
    barsPerYear,
    yScale,
    xScale,
    colorScale,
  } = useMemo(() => {
    if (!svgContainerWidth || !measurements.length) {
      return {
        linesPerYear: {},
        yScale: undefined,
        mappedXScale: undefined,
        xScale: undefined,
        colorScale: undefined,
      }
    }

    const barsPerYear: Record<string, [number, number]> = Object.fromEntries(measurements.map(([year, measurements], index) => {
      const values = measurements.filter(m => m.filter(Boolean).length >= 2)
        .map(([measurement, previousMeasurement]: MeasurementHistory) => {
          const daysBetween = moment(measurement.createdAt)
            .endOf('day')
            .diff(moment(previousMeasurement.createdAt)
              .startOf('day'), 'days') || 1
          const delta = measurement.value - previousMeasurement.value
          return delta / daysBetween
        })

      // We only want to show negative values if the meter is refillable and does not prefer positive values
      const refillableMultiplier = areValuesDepleting ? -1 : 1
      const totalUsagePositive = values.filter(value => isRefillable ? value * refillableMultiplier <= 0 : value >= 0).reduce((acc, curr) => acc + curr, 0)

      // Only want to estimate for the current year
      let totalUsageCurrentYear = 0
      // if(index === 0) {
      //   // Estimate the total usage for the current year
      //   const daysIntoCurrentYear = moment().diff(moment().startOf('year'), 'days')
      //   const daysInCurrentYear = moment().endOf('year').diff(moment().startOf('year'), 'days')
//
      //   totalUsageCurrentYear = totalUsagePositive / daysIntoCurrentYear * daysInCurrentYear
      // }

      // To get a better estimation I would have to
      // 1. Compare the usage of the current year up until now with the usage of the previous year up until now (-1 year)
      // 2. Get the usage of the previous year for the rest of the year
      // 3. Calculate the difference between the two usages and add it to the current usage

      return [year, [totalUsagePositive, totalUsageCurrentYear]]
    }) ?? [])

    const PossibleColors = Appearance.getColorScheme() === 'dark' ? ChartColorsDark : ChartColorsLight

    const interpolator = d3.piecewise(d3.interpolateHcl, PossibleColors)
    const colorAmount = Math.max(2, Object.keys(barsPerYear).length)
    const colors = d3.quantize(interpolator, colorAmount)

    const colorScale = d3.scaleOrdinal()
      .domain(Object.keys(barsPerYear))
      .range(colors)

    const [minValue = 0, maxValue = 0] = d3.extent(Object.values(barsPerYear).map(([value]) => value))
    const yScale = d3.scaleLinear()
      .domain([Math.min(0, minValue), Math.max(0, maxValue)])
      .nice()
      .range([svgContainerHeight - ChartPadding.bottom, ChartPadding.top])
    const xScale = d3.scaleBand()
      .domain(measurements.map(([year]) => year))
      .range([ChartPadding.left, svgContainerWidth - ChartPadding.right])
      .padding(.25)

    return {
      barsPerYear,
      yScale,
      xScale,
      colorScale,
    }
  }, [measurements, svgContainerWidth, isRefillable, areValuesDepleting])

  return <View
    style={ {
      minHeight: svgContainerWidth * .6,
      height: svgContainerWidth * .6,
      position: 'relative',
    } }
    onLayout={ ({ nativeEvent: { layout } }) => setSvgContainerWidth(layout.width) }
  >
    <Svg
      width={ svgContainerWidth }
      height={ svgContainerHeight }
    >
      <G>
        {
          yScale && yScale.ticks(5)
            .map(tick => <G
              translateY={ yScale(tick) }
              key={ tick }
            >
              <SvgText
                x={ ChartPadding.left - 2 }
                translateY={ 2 }
                textAnchor='end'
                fontSize={ 8 }
                fontWeight={ 100 }
                strokeWidth={ .6 }
                opacity={ .8 }
                stroke={ Colors.onSurface }
              >{ tick /*+ " " + route.params.meter.unit*/ }</SvgText>
              <Line
                x1={ ChartPadding.left }
                x2={ svgContainerWidth - ChartPadding.right }
                opacity={ .8 }
                stroke={ Colors.onSurface }
                strokeWidth={ 1 }
              />
            </G>)
        }
      </G>
      <G>
        {
          xScale && Object.entries(barsPerYear)
            .map(([label, [,value]], i) => <G
              translateX={ xScale(label) }
              key={ label + i }
            >
              <SvgText
                x={ xScale.bandwidth() / 2 }
                y={ svgContainerHeight - ChartPadding.bottom + 10 }
                textAnchor='middle'
                fontSize={ 8 }
                fontWeight={ 100 }
                strokeWidth={ .6 }
                opacity={ .8 }
                stroke={ Colors.onSurface }
              >
                { label }
              </SvgText>
            </G>)
        }
      </G>
      {
        colorScale && Object.entries(barsPerYear)
          .map(([year, [value, estimatedValue]]) => <G key={ year }>
            <Rect
              x={ xScale(year) }
              y={ value >= 0 ? yScale(0) : yScale(value) }
              width={ xScale.bandwidth() }
              height={ value >= 0 ? yScale(value) - yScale(0) : yScale(0) - yScale(value) }
              fill={ colorScale(year) ?? Colors.primary }
            />
            <Rect
              x={ xScale(year) }
              y={ estimatedValue >= 0 ? yScale(0) : yScale(estimatedValue) }
              width={ xScale.bandwidth() }
              height={ estimatedValue >= 0 ? yScale(estimatedValue) - yScale(0) : yScale(0) - yScale(estimatedValue) }
              fill={ colorScale(year) ?? Colors.primary }
              opacity={ .6}
            />
          </G>)
      }
    </Svg>
  </View>
}
