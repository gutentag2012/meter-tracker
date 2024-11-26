import { getYearlyUsagesForMeter } from '@/modules/readings/readings.query'
import { useMemo } from 'react'
import { useChartColors } from '@/lib/constants/theme'
import {
  extent,
  interpolateHcl,
  piecewise,
  quantize,
  scaleBand,
  scaleLinear,
  scaleOrdinal,
} from 'd3'
import { useFont } from '@shopify/react-native-skia'

export function useUsagePerYearData(
  data: Awaited<ReturnType<typeof getYearlyUsagesForMeter>>,
  width: number,
  height: number,
  paddingX: number,
  paddingY: number
) {
  const chartColors = useChartColors()
  const font = useFont(require('@/assets/fonts/SpaceMono-Regular.ttf'), 12)
  return useMemo(() => {
    if (!font) return { xScale: null, yScale: null, colorScale: null }
    const yearWidth = font.measureText('0000').width

    const years = data.map((r) => `${r.year}`)

    const interpolator = piecewise(interpolateHcl, chartColors)
    const amountOfYears = Math.max(2, years.length)
    const colors = quantize(interpolator, amountOfYears)
    const colorScale = scaleOrdinal().domain(years).range(colors)

    const globalXDomain = extent(data.map((r) => r.usage)) as [number, number]
    globalXDomain[0] = Math.min(0, globalXDomain[0])

    const yScale = scaleBand()
      .domain(years)
      .range([height - paddingY, paddingY])
      .padding(0.25)
    const xScale = scaleLinear()
      .domain(globalXDomain)
      .range([paddingX + yearWidth + 8, width - paddingX])
    return {
      xScale,
      yScale,
      colorScale,
    }
  }, [data, chartColors, paddingX, paddingY, width, height, font])
}
