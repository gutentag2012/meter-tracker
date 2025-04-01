import { Dimensions, Text, TouchableOpacity, View } from 'react-native'
import { Stack } from 'expo-router/stack'
import { Href, useLocalSearchParams } from 'expo-router'
import { useContractById } from '@/modules/contracts/contracts.query'
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
import { endOfMonth, startOfMonth } from 'date-fns'

const width = Dimensions.get('window').width

export default function Page() {
  const colors = useColors()
  const defaultStyles = useDefaultStyles()
  const { contractId: contractIdRaw } = useLocalSearchParams()
  const contractId = parseInt(contractIdRaw as string)
  const [contract] = useContractById(contractId)

  const defaultFrom = useMemo(() => startOfMonth(new Date()), [])
  const defaultUntil = useMemo(() => endOfMonth(new Date()), [])

  const { filters, openFilter, FilterBottomSheet } = useFilterBar(defaultFrom, defaultUntil)
  const allYears = useSignal<string[]>([])

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
          <Text style={[defaultStyles.detail, {flex: 1}]}>
            {filters.from.value ? formatDate(filters.from.value) : "Open"} - {filters.until.value ? formatDate(filters.until.value) : "Open"}
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

        <View
          style={{
            borderRadius: 4,
            backgroundColor: colors.card,
            width: "100%",
            height: ((width - 36) * 2) / 4,
          }}
        />

        <View style={[defaultStyles.row, {marginTop: 8}]}>
          <View style={{flex: 1}}>
            <Text style={[defaultStyles.cardTitle, {paddingInline: 16, paddingBlock: 8, backgroundColor: colors.card, borderTopLeftRadius: 4, borderTopRightRadius: 4}]}>200 kwh</Text>
            <Text style={[defaultStyles.cardTitle, {paddingInline: 16, paddingBlock: 8, backgroundColor: colors.card + "77", borderBottomLeftRadius: 4, borderBottomRightRadius: 4}]}>10 €</Text>
          </View>
          <View>
            <Text style={[defaultStyles.cardTitle, {paddingInline: 16, paddingBlock: 8, backgroundColor: colors.card, borderTopLeftRadius: 4, borderTopRightRadius: 4}]}>2 kwh/day</Text>
            <Text style={[defaultStyles.cardTitle, {paddingInline: 16, paddingBlock: 8, backgroundColor: colors.card + "77", borderBottomLeftRadius: 4, borderBottomRightRadius: 4}]}>0,53 €/day</Text>
          </View>
        </View>

        <View
          style={{
            borderRadius: 4,
            backgroundColor: colors.card,
            width: "100%",
            height: 48,
            marginTop: 8,
          }}
        />

        <FilterBottomSheet allYears={allYears} />
      </BottomSheetModalProvider>
    </GestureHandlerRootView>
  )
}
