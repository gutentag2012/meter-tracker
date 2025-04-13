import { Text, TouchableOpacity, View } from 'react-native'
import { Stack } from 'expo-router/stack'
import { Href, Link, useLocalSearchParams, useRouter } from 'expo-router'
import { FilterIcon, PlusIcon } from 'lucide-react-native'
import { useMeterById } from '@/modules/meters/meters.query'
import { makeHeaderBackButton } from '@/modules/general/components/header/HeaderBackButton'
import { HeaderButtonsWithEdit } from '@/modules/general/components/header/HeaderButtons'
import { GestureHandlerRootView } from 'react-native-gesture-handler'
import {
  BottomSheetModal,
  BottomSheetModalProvider,
} from '@gorhom/bottom-sheet'
import { useEffect, useRef } from 'react'
import { useSignal } from '@preact/signals-react'
import { useColors, useDefaultStyles } from '@/modules/general/theme'
import {
  useReadingsForMeterFiltered,
  useYearlyUsagesForMeter,
} from '@/modules/readings'
import { translate } from '@/modules/general/translations'
import { PaginatedGraphs } from '@/modules/meters/components/graphs'
import { ReadingList } from '@/modules/readings/components'
import { useFilterBar } from '@/modules/general/components/filterbar/useFilterBar'
import { useSignals } from '@preact/signals-react/runtime'

export default function Page() {
  useSignals()
  const router = useRouter()
  const colors = useColors()
  const defaultStyles = useDefaultStyles()

  const { meterId: meterIdRaw } = useLocalSearchParams()
  const meterId = parseInt(meterIdRaw as string)
  const [meter] = useMeterById(meterId)

  const { filters, openFilter, FilterBottomSheet } = useFilterBar()

  const [readings] = useReadingsForMeterFiltered(
    meterId,
    filters.from,
    filters.until,
    filters.selectedYears,
  )
  const [yearlyUsages] = useYearlyUsagesForMeter(
    meterId,
    filters.from,
    filters.until,
    filters.selectedYears,
  )

  const allYears = useSignal<string[]>([])
  useEffect(() => {
    const newYears = [
      ...readings
        .filter((r) => r.differencePerDay !== null)
        .reduce((acc, reading) => {
          const year = reading.readingTimestamp.getFullYear().toString()
          acc.add(year)
          return acc
        }, new Set<string>()),
    ]
    if (newYears.length >= allYears.peek().length) {
      allYears.value = newYears
    }
  }, [readings, allYears])

  return (
    <GestureHandlerRootView style={[defaultStyles.pageContainer]}>
      <BottomSheetModalProvider>
        <Stack.Screen
          options={{
            title: meter?.name || '',
            headerTitleStyle: defaultStyles.pageHeader,
            headerLeft: makeHeaderBackButton(true),
            headerRight: HeaderButtonsWithEdit(
              `/meter/${meterId}/edit` as Href,
            ),
          }}
        />

        <PaginatedGraphs readings={readings} yearlyUsages={yearlyUsages} />

        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'flex-end',
            marginBlock: 8,
          }}
        >
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

        <ReadingList readings={readings} />

        <FilterBottomSheet allYears={allYears} />
      </BottomSheetModalProvider>
    </GestureHandlerRootView>
  )
}
