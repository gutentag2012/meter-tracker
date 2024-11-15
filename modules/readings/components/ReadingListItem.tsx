import { Text, TouchableOpacity, View } from 'react-native'
import { ChangeIndicatorIcon } from '@/lib/components/ChangeIndicatorIcon'
import { CalendarIcon, DiffIcon } from 'lucide-react-native'
import { formatDate, formatNumber, translate } from '@/lib/translations/i18n'
import { useColors, useDefaultStyles } from '@/lib/constants/theme'
import { Link, useLocalSearchParams } from 'expo-router'
import { useReadingById } from '@/modules/readings/readings.query'

type ReadingListItemProps = {
  reading: {
    readingId: number
    readingValue: number
    precision: number | null
    difference: number | null
    unitAbbreviation: string
    percentileChange: number | null
    differencePerDay: number | null
    readingTimestamp: Date
  }
}

export function ReadingListItem({ reading }: ReadingListItemProps) {
  const colors = useColors()
  const defaultStyles = useDefaultStyles()

  const changeColor =
    (reading.percentileChange ?? 0) > 0
      ? colors.negative
      : (reading.percentileChange ?? 0) < 0
        ? colors.positive
        : colors.textMuted

  return (
    <Link
      href={`/reading/${reading.readingId}/edit`}
      style={[{ backgroundColor: colors.card, borderRadius: 4, padding: 8, height: 56 }]}
      asChild>
      <TouchableOpacity>
        <View style={defaultStyles.row}>
          <Text style={[defaultStyles.bodyText, { flex: 1 }]}>
            {formatNumber(reading.readingValue, reading.precision)}
            <Text style={defaultStyles.detail}>
              {' '}
              {reading.difference !== null && (
                <>
                  ({reading.difference >= 0 && '+'}
                  {formatNumber(reading.difference, reading.precision)}){' '}
                </>
              )}
            </Text>
            <Text style={defaultStyles.detailSmall}>{reading.unitAbbreviation}</Text>
          </Text>
          {reading.percentileChange !== null && (
            <View style={{ flex: 1, alignItems: 'flex-end' }}>
              <View style={defaultStyles.iconText}>
                <ChangeIndicatorIcon change={reading.percentileChange ?? 0} />
                <Text
                  style={[
                    defaultStyles.detail,
                    {
                      color: changeColor,
                    },
                  ]}>
                  {formatNumber(reading.percentileChange)} %
                </Text>
              </View>
            </View>
          )}
        </View>

        <View style={{ flexDirection: 'row', gap: 16, marginTop: 'auto' }}>
          <View style={defaultStyles.iconText}>
            <CalendarIcon color={colors.textMuted} size={defaultStyles.detail.fontSize} />
            <Text
              style={[
                defaultStyles.detail,
                {
                  color: colors.textMuted,
                },
              ]}>
              {formatDate(reading.readingTimestamp, 'PP')}
            </Text>
          </View>
          {reading.differencePerDay !== null && (
            <View style={defaultStyles.iconText}>
              <DiffIcon color={colors.textMuted} size={defaultStyles.detail.fontSize} />
              <Text
                style={[
                  defaultStyles.detail,
                  {
                    color: colors.textMuted,
                  },
                ]}>
                {formatNumber(reading.differencePerDay, reading.precision)}
                <Text style={defaultStyles.detailSmall}>
                  {' '}
                  {reading.unitAbbreviation}
                  {translate('general.perDay')}
                </Text>
              </Text>
            </View>
          )}
        </View>
      </TouchableOpacity>
    </Link>
  )
}
