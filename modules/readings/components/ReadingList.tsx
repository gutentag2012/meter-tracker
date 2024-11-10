import { useColors, useDefaultStyles } from '@/lib/constants/theme'
import { useLocalSearchParams } from 'expo-router'
import { useReadingsForMeter } from '@/modules/readings/readings.query'
import { formateDate } from '@/lib/translations/i18n'
import { Text, View } from 'react-native'
import { FlashList } from '@shopify/flash-list'
import { ReadingListItem } from '@/modules/readings/components/ReadingListItem'
import { endOfMonth, startOfMonth } from 'date-fns'

export function ReadingList() {
  const colors = useColors()
  const defaultStyles = useDefaultStyles()
  const { meterId } = useLocalSearchParams()

  const [readings] = useReadingsForMeter(parseInt(meterId as string))

  const aggregatedReadingValues = readings.reduce(
    (acc, reading, index) => {
      const monthString = formateDate(reading.readingTimestamp, 'MMMM yyyy')
      if (!(monthString in acc)) {
        acc[monthString] = []
      }
      acc[monthString].push(reading)
      return acc
    },
    {} as Record<string, typeof readings>
  )
  const readingsWithHeadings = Object.entries(aggregatedReadingValues).flatMap(
    ([monthString, items], index, array) => {
      const nextItems = array.at(index - 1)?.[1] ?? []
      const previousItems = array.at(index + 1)?.[1] ?? []
      const previousFirst = previousItems.at(0)
      const nextLast = nextItems.at(-1)

      const combinedValue = items.reduce((acc, item, index, array) => {
        const nextItem = array.at(index + 1)
        if (!nextItem) return acc
        const timeDiff = item.readingTimestamp.getTime() - nextItem.readingTimestamp.getTime()
        acc += (timeDiff / 1000) * item.differencePerSecond
        return acc
      }, 0)

      const currentLast = items.at(0)
      const currentFirst = items.at(-1)
      const partialValueToNext =
        nextLast && currentLast
          ? ((endOfMonth(currentLast.readingTimestamp).getTime() -
              currentLast.readingTimestamp.getTime()) /
              1000) *
            nextLast.differencePerSecond
          : 0
      const partialValueToPrevious =
        previousFirst && currentFirst
          ? ((currentFirst.readingTimestamp.getTime() -
              startOfMonth(currentFirst.readingTimestamp).getTime()) /
              1000) *
            currentFirst.differencePerSecond
          : 0

      const value = partialValueToPrevious + combinedValue + partialValueToNext
      return [{ type: 'header' as const, title: monthString, value }, ...items]
    }
  )
  const stickyIndices = readingsWithHeadings
    .map((item, index) => 'type' in item && item.type === 'header' && index)
    .filter((val): val is number => val !== false)

  const unit = readings.at(0)?.unitAbbreviation ?? ''

  return (
    <FlashList
      contentContainerStyle={{ paddingBottom: 16 }}
      data={readingsWithHeadings}
      stickyHeaderIndices={stickyIndices}
      renderItem={({ item }) => {
        if ('type' in item && item.type === 'header') {
          return (
            <View
              style={[
                defaultStyles.row,
                {
                  backgroundColor: colors.background,
                  padding: 8,
                },
              ]}>
              <Text style={[defaultStyles.cardTitle, { flex: 1 }]}>{item.title}</Text>
              <Text style={[defaultStyles.detail, { flex: 1, textAlign: 'right' }]}>
                {item.value.toFixed(2)}
                <Text style={defaultStyles.detailSmall}> {unit}</Text>
              </Text>
            </View>
          )
        }
        return <ReadingListItem reading={item as (typeof readings)[number]} />
      }}
      ItemSeparatorComponent={({ trailingItem }) => {
        const trailingIsMonth = 'type' in trailingItem && trailingItem.type === 'header'
        return <View style={{ height: trailingIsMonth ? 16 : 8 }} />
      }}
      estimatedItemSize={56}
    />
  )
}
