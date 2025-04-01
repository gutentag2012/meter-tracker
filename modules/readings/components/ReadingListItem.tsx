import { Text, TouchableOpacity, View } from 'react-native'
import { ChangeIndicatorIcon } from '@/modules/general/components/interface/ChangeIndicatorIcon'
import {CalendarIcon, DiffIcon, EyeIcon} from 'lucide-react-native'
import { Link } from 'expo-router'
import { Fragment } from 'react'
import { useDefaultStyles, useColors } from '@/modules/general/theme'
import {
  formatDate,
  formatNumber,
  translate,
} from '@/modules/general/translations'
import {getAllReadingsForMeter} from "@/modules/readings";

type ReadingListItemProps = {
  reading: Awaited<ReturnType<typeof getAllReadingsForMeter>>[number]
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
      style={[
        {
          backgroundColor: colors.card,
          borderRadius: 4,
          padding: 8,
          height: 56,
        },
      ]}
      asChild
    >
      <TouchableOpacity>
        <View style={defaultStyles.row}>
          <Text style={[defaultStyles.bodyText, { flex: 1 }]}>
            {formatNumber(reading.readingValue, reading.precision)}
            <Text style={defaultStyles.detail}>
              {' '}
              {reading.difference !== null && (
                <Fragment>
                  ({reading.difference >= 0 && '+'}
                  {formatNumber(reading.difference, reading.precision)}){' '}
                </Fragment>
              )}
            </Text>
            <Text style={defaultStyles.detailSmall}>
              {reading.unitAbbreviation}
            </Text>
          </Text>
          {reading.percentileChange !== null && (
            <View style={{ flex: 1, alignItems: 'flex-end' }}>
              <View style={[defaultStyles.iconText, { flex: 1 }]}>
                <ChangeIndicatorIcon change={reading.percentileChange ?? 0} />
                <Text
                  style={[
                    defaultStyles.detail,
                    {
                      color: changeColor,
                      minWidth: 0,
                    },
                  ]}
                >
                  {formatNumber(reading.percentileChange)} %{' '}
                  {/*This is a workaround, since the % for some reason is hidden for larger numbers*/}
                </Text>
              </View>
            </View>
          )}
        </View>

        <View style={{ flexDirection: 'row', gap: 16, marginTop: 'auto' }}>
          <View style={defaultStyles.iconText}>
            <CalendarIcon
              color={colors.textMuted}
              size={defaultStyles.detail.fontSize}
            />
            <Text
              style={[
                defaultStyles.detail,
                {
                  color: colors.textMuted,
                },
              ]}
            >
              {formatDate(reading.readingTimestamp, 'PP')}
            </Text>
          </View>
          {reading.differencePerDay !== null && (
            <View style={defaultStyles.iconText}>
              <DiffIcon
                color={colors.textMuted}
                size={defaultStyles.detail.fontSize}
              />
              <Text
                style={[
                  defaultStyles.detail,
                  {
                    color: colors.textMuted,
                  },
                ]}
              >
                {formatNumber(reading.differencePerDay, reading.precision)}
                <Text style={defaultStyles.detailSmall}>
                  {' '}
                  {reading.unitAbbreviation}
                  {translate('general.perDay')}
                </Text>
              </Text>
            </View>
          )}
          {(reading.realValue !== null && reading.realValue !== undefined && reading.realValue !== reading.readingValue) && (
            <View style={defaultStyles.iconText}>
              <EyeIcon
                color={colors.textMuted}
                size={defaultStyles.detail.fontSize}
              />
              <Text
                style={[
                  defaultStyles.detail,
                  {
                    color: colors.textMuted,
                  },
                ]}
              >
                {formatNumber(reading.realValue, reading.precision)}
                <Text style={defaultStyles.detailSmall}>
                  {' '}
                  {reading.unitAbbreviation}
                </Text>
              </Text>
            </View>
          )}
        </View>
      </TouchableOpacity>
    </Link>
  )
}
