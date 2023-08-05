import * as d3 from 'd3'
import moment from 'moment'
import * as React from 'react'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { Appearance, RefreshControl, SectionList, SectionListRenderItem, StyleSheet } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import Svg, { G, Line, Path, Rect, Text as SvgText } from 'react-native-svg'
import { Colors, Text, View } from 'react-native-ui-lib'
import { AppBar } from '../components/AppBar'
import { FloatingActionButton } from '../components/FloatingActionButton'
import { GlobalToast } from '../components/GlobalToast'
import { IconButton } from '../components/IconButton'
import { AddIcon } from '../components/icons/AddIcon'
import { BackIcon } from '../components/icons/BackIcon'
import { CheckCircleIcon } from '../components/icons/CheckCircleIcon'
import { EditIcon } from '../components/icons/EditIcon'
import { SettingsIcon } from '../components/icons/SettingsIcon'
import { MeasurementListEntry } from '../components/measurements/MeasurementListEntry'
import { HomeStackScreenProps } from '../navigation/types'
import Measurement from '../services/database/entities/measurement'
import Meter from '../services/database/entities/meter'
import { useManualUpdatedData, useRepository } from '../services/database/GenericRepository'
import MeasurementService from '../services/database/services/MeasurementService'
import MeterService from '../services/database/services/MeterService'
import EventEmitter from '../services/events'
import { t } from '../services/i18n'
import { ChartColorsDark, ChartColorsLight, Typography } from '../setupTheme'

type MeasurementHistory = [Measurement, Measurement, Measurement]
type ClusteredMeasurements = Array<[string, Array<MeasurementHistory>]>

const ChartPadding = {
  top: 16,
  left: 32,
  bottom: 16,
  right: 16,
}

export default function MeterSummaryScreen({
                                             navigation,
                                             route,
                                           }: HomeStackScreenProps<'MeterSummaryScreen'>) {
  const [loading, setLoading] = useState(true)
  const [measurements, setMeasurements] = useState<ClusteredMeasurements>([])

  const [svgContainerWidth, setSvgContainerWidth] = useState(0)
  const svgContainerHeight = svgContainerWidth * .6

  const [repo, service] = useRepository(MeasurementService)
  const [meterRepo] = useRepository(MeterService)

  const loadData = useCallback(async () => {
    setLoading(true)

    const getMeasurementStatement = service.getMeasurementsForMeter(route.params.meter.id!)
    const measurements = await repo.executeRaw<Array<unknown>>(getMeasurementStatement)
      .then(res => res?.map(json => service.fromJSON(json)) ?? [])

    const clusters: { [year: string]: Array<[Measurement, Measurement, Measurement]> } = {}

    const measurementsCopy = measurements.slice()
    const measurementsShifted = measurements.slice(1)
    const measurementsShiftedTwice = measurements.slice(2)

    for (let i = 0; i < measurementsCopy.length; i++) {
      const measurement = measurementsCopy[i]
      const previousMeasurement = measurementsShifted[i]
      const previousPreviousMeasurement = measurementsShiftedTwice[i]

      const year = moment(measurement.createdAt)
        .format('YYYY')
      if (!clusters[year]) {
        clusters[year] = []
      }

      clusters[year].push([
        measurement, previousMeasurement, previousPreviousMeasurement,
      ])
    }

    setMeasurements(Object.entries(clusters)
      .sort(([a], [b]) => parseInt(b) - parseInt(a)),
    )

    setLoading(false)
  }, [route.params.meter.id])

  useManualUpdatedData(loadData, ['data-inserted'])

  const onEndEditing = useCallback(async () => {
    setLoading(true)
    const newMeter = await meterRepo.getDataById<Meter>(route.params.meter.id!)
    navigation.setParams({ meter: newMeter })
    setLoading(false)
  }, [route.params.meter.id])

  const {
    linesPerYear,
    yScale,
    mappedXScale,
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
    type DataEntry = { value: number, date: number }
    const linesPerYear: Record<string, string> = {}

    const dataGrouped: Record<string, Array<DataEntry>> = Object.fromEntries(
      measurements.map(([year, measurements]) => [
        year, measurements.filter(m => m.filter(Boolean).length >= 2)
          .map(([measurement, previousMeasurement, previousPreviousMeasurement]) => {
            const daysBetween = moment(measurement.createdAt)
              .endOf('day')
              .diff(moment(previousMeasurement.createdAt)
                .startOf('day'), 'days') || 1
            const delta = measurement.value - previousMeasurement.value

            return {
              value: previousMeasurement.value == 0 && previousPreviousMeasurement?.value === 0
                     ? 0
                     : delta / daysBetween,
              date: moment(measurement.createdAt)
                .year(0)
                .valueOf(),
            }
          }),
      ]))

    const PossibleColors = Appearance.getColorScheme() === 'dark' ? ChartColorsDark : ChartColorsLight

    const interpolator = d3.piecewise(d3.interpolateHcl, PossibleColors)
    const colorAmount = Math.max(2, Object.keys(dataGrouped).length)
    const colors = d3.quantize(interpolator, colorAmount)

    const colorScale = d3.scaleOrdinal()
      .domain(Object.keys(dataGrouped))
      .range(colors)

    const allData = Object.values(dataGrouped)
      .flat()
    const [minValue = 0, maxValue = 0] = d3.extent(allData, (entry: DataEntry) => entry.value)
    const [minDate = Date.now(), maxDate = Date.now()] = d3.extent(allData, (entry: DataEntry) => entry.date)
    const yScale = d3.scaleLinear()
      .domain([minValue, maxValue])
      .nice()
      .range([svgContainerHeight - ChartPadding.bottom, ChartPadding.top])
    const xScale = d3.scaleTime()
      .domain([minDate, maxDate])
      .nice(1)
      .range([ChartPadding.left, svgContainerWidth - ChartPadding.right])

    for (const [year, data] of Object.entries(dataGrouped)) {
      linesPerYear[year] = d3.line<DataEntry>()
        .x(d => xScale(d.date))
        .y(d => yScale(d.value))
        .curve(d3.curveNatural)(data) ?? ''
    }

    const mappedXScale: Array<[number, string]> = xScale.ticks()
      .map(tick => [
        moment(tick)
          .valueOf(), moment(tick)
          .format('MMM'),
      ])

    return {
      linesPerYear,
      yScale,
      mappedXScale,
      xScale,
      colorScale,
    }
  }, [measurements, svgContainerWidth])

  // const left = useSharedValue(0)
  // const top = useSharedValue(0)
  // const popupStyle = useAnimatedStyle(() => ({
  //   top: top.value,
  //   left: left.value,
  // }))

  const chunkSize = 5
  const chunkedYears = Object.keys(linesPerYear)
    .reduce((acc, year, index) => {
      const chunkIndex = Math.floor(index / chunkSize)
      if (!acc[chunkIndex]) {
        acc[chunkIndex] = []
      }
      acc[chunkIndex].push(year)
      return acc
    }, [] as Array<Array<string>>)

  const renderListItem: SectionListRenderItem<MeasurementHistory> = useCallback(({
                                                                                   item: [measurement, previousMeasurement, previousPreviousMeasurement],
                                                                                   section,
                                                                                 }) => {

    const onPress = useCallback(() => navigation.navigate('AddMeasurementModal', {
        meter: measurement.meter,
        editMeasurement: measurement,
        onEndEditing: loadData,
      }), [measurement, loadData, navigation],
    )

    const onDelete = useCallback(async () => {
      if (!measurement.id) {
        return
      }
      let didUndo = false

      setMeasurements(measurements.map(([title, data]) => {
        if (title !== section.title) {
          return [title, data]
        }
        return [title, data.filter(([m]) => m.id !== measurement.id)]
      }))

      await repo.deleteEntry(measurement.id)

      EventEmitter.emitToast({
        message: t('utils:deleted_reading'),
        icon: CheckCircleIcon,
        action: {
          label: t('utils:undo'),
          onPress: () => {
            if (didUndo) {
              return
            }

            didUndo = true
            EventEmitter.emitToast(undefined)
            repo.insertData(measurement)
          },
        },
        onDismiss: () => {
          if (didUndo) {
            return
          }

          loadData()
        },
      })
    }, [measurement, loadData, repo, measurements, section.title])

    return <MeasurementListEntry
      measurement={ measurement }
      previousMeasurement={ previousMeasurement }
      previousPreviousMeasurement={ previousPreviousMeasurement }
      onPress={ onPress }
      onDelete={ onDelete }
    />
  }, [measurements])


  return (
    <SafeAreaView
      style={ styles.container }
      bg-backgroundColor
    >
      <AppBar
        title={ route.params.meter.name }
        leftAction={ <>
          <IconButton
            style={ { marginRight: 8 } }
            getIcon={ () => <BackIcon color={ Colors.onBackground } /> }
            onPress={ () => navigation.pop() }
          />
        </> }
        actions={ <>
          <IconButton
            getIcon={ () => <EditIcon color={ Colors.onBackground } /> }
            onPress={ () => navigation.navigate('AddMeterModal', {
              editMeter: route.params.meter,
              onEndEditing,
            }) }
          />
          <IconButton
            getIcon={ () => <SettingsIcon color={ Colors.onBackground } /> }
            onPress={ () => navigation.navigate('SettingsScreen') }
          />
        </> }
      />

      <Text style={ styles.sectionTitle }>{ t('meter:usage_per_day') }</Text>
      <View
        style={ {
          minHeight: svgContainerWidth * .6,
          height: svgContainerWidth * .6,
          marginBottom: 24 * chunkedYears.length,
          position: 'relative',
        } }
        onLayout={ ({ nativeEvent: { layout } }) => setSvgContainerWidth(layout.width) }
      >
        {/*<Animated.View*/ }
        {/*  style={ [*/ }
        {/*    {*/ }
        {/*      width: 25,*/ }
        {/*      height: 25,*/ }
        {/*      backgroundColor: 'red',*/ }
        {/*      position: 'absolute',*/ }
        {/*    }, popupStyle,*/ }
        {/*  ] }*/ }
        {/*/>*/ }
        <Svg
          width={ svgContainerWidth }
          height={ svgContainerHeight + 24 * chunkedYears.length }
          // onTouchMove={ e => {
          //   top.value = (e.nativeEvent.locationY) - 50
          //   left.value = (e.nativeEvent.locationX)
          // } }
          // onTouchStart={ e => {
          //   top.value = (e.nativeEvent.locationY) - 50
          //   left.value = (e.nativeEvent.locationX)
          // } }
          // onTouchEnd={ e => {
          //   top.value = (0)
          //   left.value = (0)
          // } }
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
              mappedXScale && xScale && mappedXScale.map(([tick, label], i) => <G
                translateX={ xScale(tick) }
                key={ label + i }
              >
                <SvgText
                  y={ svgContainerHeight - ChartPadding.bottom + 10 }
                  textAnchor='middle'
                  fontSize={ 8 }
                  fontWeight={ 100 }
                  strokeWidth={ .6 }
                  opacity={ .8 }
                  stroke={ Colors.onSurface }
                >{ label }</SvgText>
              </G>)
            }
          </G>
          {
            colorScale && chunkedYears.map((chunk, chunkIndex) => <G
              key={ `chunk-${ chunkIndex }` }
              translateX={ ChartPadding.left }
              translateY={ chunkIndex * 24 + svgContainerHeight + 4 }
            >
              {
                chunk
                  .map((year, index) => <G
                      key={ `legend-${ year }-${ index }` }
                      translateX={ index * 56 }
                    >
                      <Rect
                        rx={ 2 }
                        width={ 8 }
                        height={ 8 }
                        fill={ colorScale(year) ?? Colors.primary }
                      />
                      <SvgText
                        fontWeight={ 400 }
                        x={ 8 + 4 }
                        y={ 8 }
                        fill={ Colors.onSurface }
                        opacity={ .8 }
                      >{ year }</SvgText>
                    </G>,
                  )
              }
            </G>)
          }
          {
            colorScale && Object.entries(linesPerYear)
              .map(([year, line]) => <G key={ year }>
                <Path
                  d={ line ?? '' }
                  stroke={ colorScale(year) ?? Colors.primary }
                  strokeWidth={ 3 }
                  opacity={ .8 }
                  strokeLinecap='round'
                  fill='none'
                />
              </G>)
          }
        </Svg>
      </View>

      <SectionList<MeasurementHistory>
        sections={ measurements.map(([title, data]) => ({
          title,
          data,
        })) }
        keyExtractor={ ([item]) => `${ item.id }` }
        initialNumToRender={ 15 }
        renderItem={ renderListItem }
        renderSectionHeader={ ({ section }) => <Text
          style={ styles.sectionTitle }
        >
          { t('utils:history') } { section.title }
        </Text> }
        stickySectionHeadersEnabled
        refreshControl={ <RefreshControl
          refreshing={ loading }
          onRefresh={ loadData }
          tintColor={ Colors.onSecondaryContainer }
          progressBackgroundColor={ Colors.secondaryContainer }
          colors={ [Colors.onSecondaryContainer] }
        /> }
      />

      <GlobalToast
        renderAttachment={ () => <FloatingActionButton
          icon={ AddIcon }
          onPress={ () => navigation.navigate('AddMeasurementModal', { meter: route.params.meter }) }
        />
        }
      />
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  sectionTitle: {
    ...Typography.LabelSmall,
    textAlignVertical: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: Colors.background,
    color: Colors.onBackground,
  },
  button: {
    marginHorizontal: 16,
    marginVertical: 8,
  },
})
