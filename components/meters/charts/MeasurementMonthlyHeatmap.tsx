import * as d3 from 'd3'
import moment from 'moment/moment'
import React, { FunctionComponent, useMemo, useState } from 'react'
import { Appearance } from 'react-native'
import Svg, { G, Rect, Text as SvgText } from 'react-native-svg'
import { Colors, View } from 'react-native-ui-lib'
import { ClusteredMeasurements, MeasurementHistory } from '../../../screens/MeterSummaryScreen'
import { ChartColorsDark, ChartColorsLight } from '../../../setupTheme'

const ChartPadding = {
  top: 16,
  left: 32,
  bottom: 16,
  right: 16,
}

type Props = {
  measurements: ClusteredMeasurements
  isRefillable?: boolean
  areValuesDepleting?: boolean
}

const padding = 1.125

export const MeasurementMonthlyHeatmap: FunctionComponent<Props> = ({
                                                                      measurements,
                                                                      isRefillable,
                                                                      areValuesDepleting,
                                                                    }) => {
  const [svgContainerWidth, setSvgContainerWidth] = useState(0)
  const svgContainerHeight = svgContainerWidth * .6 + 12

  const {
    barsPerYear,
    months,
    yScale,
    xScale,
    colorScale,
  } = useMemo(() => {
    if (!svgContainerWidth || !measurements.length) {
      return {
        barsPerYear: {},
        months: [],
        yScale: undefined,
        mappedXScale: undefined,
        xScale: undefined,
        colorScale: undefined,
      }
    }

    const barsPerYear: Record<string, Array<readonly [string, number]>> = Object.fromEntries(
      measurements.map(([year, measurements]) => {
        // Chunk the measurements per month of the createdAt date of the measurement
        const differencesPerMonth = measurements
          .map(([measurement, previousMeasurement, previousPreviousMeasurement]: MeasurementHistory) => {
            const month = moment(measurement.createdAt)
              .format('MMMM')

            // If the previous measurement is 0 and the one before that is 0, we assume that the meter got its first value
            if(!previousMeasurement?.value && !previousPreviousMeasurement?.value) {
              return [month, 0] as const
            }

            return [month, measurement.value - previousMeasurement.value] as const
          })
          .reduce((acc, [year, value]) => ({
            ...acc,
            [year]: [...(acc[year] ?? []), value],
          }), ({} as Record<string, Array<number>>))

        const monthlyValues = Object.entries(differencesPerMonth)
          .map(([month, values]) => [
            month, values.filter(value => {
                const refillableMultiplier = areValuesDepleting ? -1 : 1
                return isRefillable ? value * refillableMultiplier <= 0 : value >= 0
              })
              .reduce((acc, curr) => acc + curr, 0) / values.length,
          ] as const)

        return [year, monthlyValues]
      }) ?? [])
    const months = moment.months()

    const PossibleColors = Appearance.getColorScheme() === 'dark' ? ChartColorsDark : ChartColorsLight
    const baselineColor = `${ PossibleColors[0] }80`
    const extremeColor = PossibleColors[4]

    const [minValue = 0, maxValue = 0] = d3.extent(Object.values(barsPerYear)
      .flatMap((values) => values.flatMap(([, value]) => value)))

    const colorScale = d3.scaleLinear<string>()
      .domain([minValue, maxValue])
      .range(maxValue <= 0 ? [extremeColor, baselineColor] : [baselineColor, extremeColor])

    const yScale = d3.scaleBand()
      .domain(Object.keys(barsPerYear))
      .range([svgContainerHeight - ChartPadding.bottom, ChartPadding.top])
      .padding(padding - 1)

    const xScale = d3.scaleBand()
      .domain(months)
      .range([ChartPadding.left, svgContainerWidth - ChartPadding.right])
      .padding(padding - 1)

    return {
      barsPerYear,
      months,
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
          yScale && Object.keys(barsPerYear)
            .map((year) => {
              return <G
                translateY={ yScale(year) }
                key={ year }
              >
                <SvgText
                  y={ yScale.bandwidth() / 2 }
                  x={ ChartPadding.left - 2 }
                  textAnchor='end'
                  fontSize={ 8 }
                  fontWeight={ 100 }
                  strokeWidth={ .6 }
                  opacity={ .8 }
                  stroke={ Colors.onSurface }
                >
                  { year }
                </SvgText>
              </G>
            })
        }
      </G>
      <G>
        {
          xScale && months
            .map((month, index) => <G
              translateX={ xScale(month) }
              translateY={ index % 2 === 0 ? 4 : -6 }
              key={ month }
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
                { month }
              </SvgText>
            </G>)
        }
      </G>
      {
        colorScale && xScale && yScale && Object.entries(barsPerYear)
          .map(([year, months]) => <G
            key={ year }
            translateY={ yScale(year) }
          >
            {
              months.map(([month, value]) => <G
                key={ month }
                translateX={ xScale(month) }
              >
                <Rect
                  x={ 0 }
                  y={ 0 }
                  rx={ 2 }
                  ry={ 2 }
                  width={ xScale.bandwidth() }
                  height={ yScale.bandwidth() }
                  fill={ colorScale(value) ?? Colors.primary }
                />
              </G>)
            }
          </G>)
      }
    </Svg>
  </View>
}
