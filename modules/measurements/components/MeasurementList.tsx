import EventEmitter from '@/events'
import { t } from '@/i18n'
import { MeasurementListEntry } from '@/measurements/components/MeasurementListEntry'
import {
  measurementsForSelectedMeterGroupedByMonth,
  selectedYear,
} from '@/measurements/measurement.signals'
import { EVENT_INVALIDATE_MEASUREMENTS } from '@/measurements/measurements.constants'
import {
  deleteMeasurement,
  insertMeasurementsFromEntities,
} from '@/measurements/measurements.persistor'
import { type DetailedMeasurementWithSummaryAndContract } from '@/measurements/measurements.selector'
import { computed, useSignal, useSignalEffect } from '@preact/signals-react'
import moment from 'moment'
import * as React from 'react'
import { useCallback } from 'react'
import {
  ActivityIndicator,
  SectionList,
  type SectionListRenderItem,
  StyleSheet,
} from 'react-native'
import { Colors, Text, View } from 'react-native-ui-lib'
import { CheckCircleIcon } from '../../../components/icons/CheckCircleIcon'
import { type HomeStackScreenProps } from '../../../navigation/types'
import { Typography } from '../../../setupTheme'

const sectionedMeasurements = computed(() => {
  const measurements = measurementsForSelectedMeterGroupedByMonth.value

  return measurements.map(([title, data], index) => {
    const [, previousData] = measurements[index - 1] ?? []

    const innerDifference = data
      .slice(0, data.length - 1)
      .reduce((acc, curr) => acc + (curr.difference ?? 0), 0)

    const lastEntry = data[data.length - 1]
    const daysToStartOfMonthFromLastEntry = !lastEntry
      ? 0
      : -moment(lastEntry.createdAt).startOf('month').diff(lastEntry.createdAt, 'days')
    const differenceAfter = !lastEntry
      ? 0
      : ((lastEntry?.difference ?? 0) / (lastEntry.daysBetween ?? 1)) *
        (daysToStartOfMonthFromLastEntry + 1)

    const firstEntry = data[0]
    const previousEntry = previousData?.[previousData.length - 1]
    const daysToEndOfMonthFromFirstEntry =
      !previousEntry || !firstEntry
        ? 0
        : moment(firstEntry?.createdAt)
            .endOf('month')
            .diff(firstEntry?.createdAt, 'days')
    const differenceBefore =
      !previousEntry || !firstEntry
        ? 0
        : ((previousEntry?.difference ?? 0) / (previousEntry?.daysBetween ?? 1)) *
          (daysToEndOfMonthFromFirstEntry + 1)

    const totalDifference = innerDifference + differenceAfter + differenceBefore

    return {
      title,
      data,
      titleAddition: totalDifference,
    }
  })
})

export const MeasurementList = ({
  navigation,
}: {
  navigation: HomeStackScreenProps<'MeterSummaryScreen'>['navigation']
}) => {
  const page = useSignal(1)
  const endReached = useSignal(false)

  useSignalEffect(() => {
    // If the year changes, we want to reset the page to 1
    console.log('Year changed', selectedYear.value)
    page.value = 1
  })

  const renderListItem: SectionListRenderItem<DetailedMeasurementWithSummaryAndContract> =
    useCallback(
      ({ item: measurement }) => {
        const onPress = () =>
          navigation.navigate('AddMeasurementModal', {
            meter: measurement.meter,
            editMeasurement: measurement,
          })

        const onDelete = async () => {
          if (!measurement.id) {
            return
          }
          let didUndo = false

          const deletedMeasurement = await deleteMeasurement(measurement.id, true)
          EventEmitter.emit(EVENT_INVALIDATE_MEASUREMENTS)

          EventEmitter.emitToast({
            message: t('utils:deleted_reading'),
            icon: CheckCircleIcon,
            action: {
              label: t('utils:undo'),
              onPress: async () => {
                if (didUndo) {
                  return
                }

                didUndo = true
                EventEmitter.emitToast(undefined)
                if (!deletedMeasurement) {
                  return
                }

                await insertMeasurementsFromEntities([deletedMeasurement])
                EventEmitter.emit(EVENT_INVALIDATE_MEASUREMENTS)
              },
            },
          })
        }

        return (
          <MeasurementListEntry
            key={measurement.id}
            measurement={measurement}
            onPress={onPress}
            onDelete={onDelete}
          />
        )
      },
      [navigation]
    )

  const sections = sectionedMeasurements.value
    .filter(({ title }) => !selectedYear.value || title.split(' ')[1] === selectedYear.value)
    .slice(0, 3 * page.value)

  return (
    <SectionList<DetailedMeasurementWithSummaryAndContract>
      sections={sections}
      renderItem={renderListItem}
      renderSectionHeader={({ section }) => (
        <View style={styles.sectionTitleContainer}>
          <Text style={styles.sectionTitle}>{section.title}</Text>
          <Text style={styles.sectionTitle}>
            {(section.titleAddition ?? 0).toFixed(2)} {section.data[0]?.meter?.unit}
          </Text>
        </View>
      )}
      stickySectionHeadersEnabled
      onEndReachedThreshold={0.5}
      onEndReached={() => {
        page.value++
        endReached.value = true
      }}
      onContentSizeChange={() => {
        // If new content is loaded, the size changes, therefore we want to reset the endReached
        endReached.value = false
      }}
      ListFooterComponent={
        <View
          style={{
            marginBottom: 32,
            marginTop: 8,
            alignItems: 'center',
          }}
        >
          {!endReached.value && !!sections.length && (
            <ActivityIndicator size={'large'} animating color={Colors.primary} />
          )}
          {!sections.length && <Text style={{ textAlign: 'center' }}>{t('utils:no_data')}</Text>}
        </View>
      }
    />
  )
}

const styles = StyleSheet.create({
  sectionTitleContainer: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    display: 'flex',
    justifyContent: 'space-between',
    flexDirection: 'row',
    backgroundColor: Colors.background,
  },
  sectionTitle: {
    ...Typography.LabelSmall,
    textAlignVertical: 'center',
    color: Colors.onBackground,
    paddingHorizontal: 16,
  },
})
