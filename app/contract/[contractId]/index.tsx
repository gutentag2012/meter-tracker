import { Dimensions, Text, TouchableOpacity, View } from 'react-native'
import { Stack } from 'expo-router/stack'
import { Href, useLocalSearchParams } from 'expo-router'
import {
  useContractById,
  useContractMonthEntries,
} from '@/modules/contracts/contracts.query'
import { makeHeaderBackButton } from '@/modules/general/components/header/HeaderBackButton'
import { HeaderButtonsWithEdit } from '@/modules/general/components/header/HeaderButtons'
import { useColors, useDefaultStyles } from '@/modules/general/theme'
import { useFilterBar } from '@/modules/general/components/filterbar/useFilterBar'
import { FilterIcon } from 'lucide-react-native'
import { formatDate, translate } from '@/modules/general/translations'
import { BottomSheetModalProvider } from '@gorhom/bottom-sheet'
import { useSignal } from '@preact/signals-react'
import { GestureHandlerRootView } from 'react-native-gesture-handler'
import { useMemo } from 'react'
import { endOfDay, startOfDay, startOfMonth } from 'date-fns'
import { tax } from '@/modules/settings/tax.signals'
import { currency } from '@/modules/settings/currency.signals'

export default function Page() {
  const colors = useColors()
  const defaultStyles = useDefaultStyles()
  const { contractId: contractIdRaw } = useLocalSearchParams()
  const contractId = parseInt(contractIdRaw as string)
  const [contract] = useContractById(contractId)

  const defaultFrom = useMemo(() => startOfMonth(new Date()), [])
  const defaultUntil = useMemo(() => endOfDay(new Date()), [])

  const { filters, openFilter, FilterBottomSheet } = useFilterBar(
    defaultFrom,
    defaultUntil,
    {
      disableYear: true,
      nonOptional: true,
    },
  )
  const allYears = useSignal<string[]>([])

  const [data] = useContractMonthEntries(contractId, filters as any)

  const totalCost = data.reduce((acc, curr) => acc + curr.totalCost, 0)
  const totalCostTaxed = data.reduce(
    (acc, curr) => acc + curr.totalCost * (1 + tax.value),
    0,
  )
  const totalPayed = data.reduce(
    (acc, curr) => acc + curr.contractValuePayed,
    0,
  )

  return (
    <GestureHandlerRootView style={[defaultStyles.pageContainer]}>
      <BottomSheetModalProvider>
        <Stack.Screen
          options={{
            title: contract?.contract?.name || '',
            headerTitleStyle: defaultStyles.pageHeader,
            headerLeft: makeHeaderBackButton(true),
            headerRight: HeaderButtonsWithEdit(
              `/contract/${contractId}/edit` as Href,
            ),
          }}
        />

        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBlock: 8,
          }}
        >
          <Text style={[defaultStyles.detail, { flex: 1 }]}>
            {filters.from.value ? formatDate(filters.from.value) : 'Open'} -{' '}
            {filters.until.value ? formatDate(filters.until.value) : 'Open'}
          </Text>

          <TouchableOpacity
            style={[
              defaultStyles.ghostButton,
              { backgroundColor: 'transparent' },
            ]}
            onPress={openFilter}
          >
            <FilterIcon
              size={defaultStyles.detail.fontSize}
              stroke={colors.primary}
            />
            <Text style={[defaultStyles.detail, { color: colors.primary }]}>
              {translate('meters.graphs.filter')}
            </Text>
          </TouchableOpacity>
        </View>

        {data.map((entry) => (
          <View
            key={entry.year + entry.totalCost}
            style={{
              marginBottom: 8,
              backgroundColor: colors.card,
              padding: 8,
              borderRadius: 4,
            }}
          >
            <Text style={[defaultStyles.detail, { marginBottom: 8 }]}>
              {translate('contracts.detail.partialYear', { year: entry.year })}
            </Text>
            <View style={[defaultStyles.row, { marginBottom: 4 }]}>
              <Text style={[defaultStyles.detail, { minWidth: 64 }]}>
                {translate('contracts.detail.basePaymentHeader')}
              </Text>
              <Text
                style={[
                  defaultStyles.detail,
                  {
                    minWidth: 180,
                    textAlign: 'right',
                  },
                ]}
              >
                {entry.contractRangeDays}{' '}
                {translate('contracts.detail.daysSuffix')}
                <Text style={defaultStyles.detailSmall}>
                  {" "}({entry.contractPrice} {currency.value.currencySymbol}
                  {translate('contracts.detail.perYearSuffix')})
                </Text>
              </Text>
              <Text style={[defaultStyles.bodyText, { marginLeft: 'auto' }]}>
                {entry.contractValue?.toFixed(2)} {currency.value.currencySymbol}
              </Text>
            </View>
            <View style={[defaultStyles.row, { marginBottom: 4 }]}>
              <Text style={[defaultStyles.detail, { minWidth: 64 }]}>
                {translate('contracts.detail.usageHeader')}
              </Text>
              <Text
                style={[
                  defaultStyles.detail,
                  {
                    minWidth: 180,
                    textAlign: 'right',
                  },
                ]}
              >
                {entry.readingUsage?.toFixed(2)} {contract?.unit?.abbreviation}
                <Text style={defaultStyles.detailSmall}>
                  {" "}({entry.readingPrice} {currency.value.currencySymbol}/
                  {contract?.unit?.abbreviation})
                </Text>
              </Text>
              <Text style={[defaultStyles.bodyText, { marginLeft: 'auto' }]}>
                {entry.readingValue?.toFixed(2)} {currency.value.currencySymbol}
              </Text>
            </View>
            <View style={defaultStyles.row}>
              <Text style={[defaultStyles.bodyText, { marginLeft: 'auto' }]}>
                {entry.totalCost?.toFixed(2)} {currency.value.currencySymbol}
              </Text>
            </View>
          </View>
        ))}

        <View
          style={{ backgroundColor: colors.card, padding: 8, borderRadius: 4 }}
        >
          <View style={[defaultStyles.row]}>
            <Text style={[defaultStyles.detail, { minWidth: 64 }]}>
              {translate('contracts.detail.net')}
            </Text>
            <Text style={[defaultStyles.bodyText, { marginLeft: 'auto' }]}>
              {totalCost?.toFixed(2)} {currency.value.currencySymbol}
            </Text>
          </View>
          <View style={[defaultStyles.row]}>
            <Text style={[defaultStyles.detail, { minWidth: 64 }]}>
              {translate('contracts.detail.gross')}
              <Text style={defaultStyles.detailSmall}>
                ({((tax.value ?? 0) * 100)?.toFixed(0)} %)
              </Text>
            </Text>
            <Text style={[defaultStyles.bodyText, { marginLeft: 'auto' }]}>
              {totalCostTaxed?.toFixed(2)} {currency.value.currencySymbol}
            </Text>
          </View>
          <View style={[defaultStyles.row, { marginBottom: 4 }]}>
            <Text style={[defaultStyles.detail, { minWidth: 64 }]}>
              {translate('contracts.detail.payed')}
            </Text>
            <Text style={[defaultStyles.bodyText, { marginLeft: 'auto' }]}>
              - {totalPayed?.toFixed(2)} {currency.value.currencySymbol}
            </Text>
          </View>
          <View style={[defaultStyles.row]}>
            <Text style={[defaultStyles.detail, { minWidth: 64 }]}>
              {translate('contracts.detail.total')}
            </Text>
            <Text style={[defaultStyles.bodyText, { marginLeft: 'auto' }]}>
              {(totalCostTaxed - totalPayed)?.toFixed(2)}{' '}
              {currency.value.currencySymbol}
            </Text>
          </View>
        </View>

        <FilterBottomSheet allYears={allYears} />
      </BottomSheetModalProvider>
    </GestureHandlerRootView>
  )
}
