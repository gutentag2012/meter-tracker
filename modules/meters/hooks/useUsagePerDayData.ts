import { getAllReadingsForMeter } from '@/modules/readings/readings.query'
import { useMemo } from 'react'
import { useChartColors } from '@/lib/constants/theme'
import {
  curveCardinal,
  extent,
  interpolateHcl,
  line,
  piecewise,
  quantize,
  scaleLinear,
  scaleOrdinal,
  scaleTime,
} from 'd3'
import { useFont } from '@shopify/react-native-skia'

export function useUsagePerDayData(
  data: Awaited<ReturnType<typeof getAllReadingsForMeter>>,
  width: number,
  height: number,
  paddingX: number,
  paddingY: number
) {
  const font = useFont(require('@/assets/fonts/SpaceMono-Regular.ttf'), 12)

  const chartColors = useChartColors()
  return useMemo(() => {
    const relevantChartData = data
      .filter((r) => r.differencePerDay !== null)
      .map(
        (r) =>
          [
            new Date(1970, r.readingTimestamp.getMonth(), r.readingTimestamp.getDate()),
            r.differencePerDay,
          ] as [Date, number]
      )

    const dataPerYear = data
      .filter((r) => r.differencePerDay !== null)
      .reduce(
        (acc, reading) => {
          const year = reading.readingTimestamp.getFullYear()
          if (!(year in acc)) {
            acc[year] = []
          }
          acc[year].push([
            new Date(1970, reading.readingTimestamp.getMonth(), reading.readingTimestamp.getDate()),
            reading.differencePerDay,
          ] as [Date, number])
          return acc
        },
        {} as Record<number, typeof relevantChartData>
      )

    const interpolator = piecewise(interpolateHcl, chartColors)
    const amountOfYears = Math.max(2, Object.keys(dataPerYear).length)
    const colors = quantize(interpolator, amountOfYears)
    const colorScale = scaleOrdinal().domain(Object.keys(dataPerYear)).range(colors)

    const globalYDomain = extent(relevantChartData.map((r) => r[1])) as [number, number]

    const yScale = scaleLinear()
      .domain(globalYDomain)
      .nice()
      .range([height - paddingY, paddingY])
    const tickWidths = yScale
      .ticks()
      .map((tick) => font?.measureText(tick.toFixed(1)).width)
      .filter(Boolean) as number[]
    const maxTickWidth = Math.max(...tickWidths)
    const xScale = scaleTime()
      .domain([new Date(1970, 0, 1), new Date(1970, 11, 31)])
      .nice(1)
      .range([paddingX + maxTickWidth, width - paddingX])

    const linesPerYear = Object.fromEntries(
      Object.entries(dataPerYear).map(([year, data]) => {
        return [
          year,
          line<[Date, number]>()
            .x((d) => xScale(d[0]))
            .y((d) => yScale(d[1]))
            .curve(curveCardinal.tension(0.7))(data),
        ]
      })
    )

    return {
      linesPerYear,
      xScale,
      yScale,
      colorScale,
    }
  }, [data, chartColors, paddingX, paddingY, width, height, font])
}
