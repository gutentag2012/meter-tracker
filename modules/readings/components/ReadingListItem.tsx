import { Text, TouchableOpacity, View } from 'react-native'
import { ChangeIndicatorIcon } from '@/lib/components/ChangeIndicatorIcon'
import { CalendarIcon, DiffIcon } from 'lucide-react-native'
import { formateDate } from '@/lib/translations/i18n'
import { useColors, useDefaultStyles } from '@/lib/constants/theme'

type ReadingListItemProps = {
  reading: {
    readingValue: number
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
        ? colors.positiv
        : colors.textMuted

  return (
    <TouchableOpacity
      style={[{ backgroundColor: colors.card, borderRadius: 8, padding: 8, height: 56 }]}>
      <View style={defaultStyles.row}>
        <Text style={[defaultStyles.listEntry, { flex: 1 }]}>
          {reading.readingValue?.toFixed(2)}
          <Text style={defaultStyles.detail}>
            {' '}
            {reading.difference !== null && (
              <>
                ({reading.difference >= 0 && '+'}
                {reading.difference.toFixed(2)}){' '}
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
                {reading.percentileChange.toFixed(2)} %
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
            {formateDate(reading.readingTimestamp, 'PP')}
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
              {reading.differencePerDay.toFixed(2)}
              <Text style={defaultStyles.detailSmall}> {reading.unitAbbreviation}/day</Text>
            </Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  )
}
