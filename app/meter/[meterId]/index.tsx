import { StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import { Stack } from 'expo-router/stack'
import { Href, Link, useLocalSearchParams } from 'expo-router'
import { FilterIcon, PlusIcon } from 'lucide-react-native'
import { Button } from '@/modules/general/components/Button'
import { useMeterById } from '@/modules/meters/meters.query'
import { makeHeaderBackButton } from '@/modules/general/components/header/HeaderBackButton'
import { HeaderButtonsWithEdit } from '@/modules/general/components/header/HeaderButtons'
import { GestureHandlerRootView } from 'react-native-gesture-handler'
import {
  BottomSheetModal,
  BottomSheetModalProvider,
  BottomSheetScrollView,
} from '@gorhom/bottom-sheet'
import { useEffect, useMemo, useRef, useState } from 'react'
import { useSignal } from '@preact/signals-react'
import { useColors, useDefaultStyles } from '@/modules/general/theme'
import {
  useReadingsForMeterFiltered,
  useYearlyUsagesForMeter,
} from '@/modules/readings'
import { translate } from '@/modules/general/translations'
import { DatePicker } from '@/modules/general/components'
import { PaginatedGraphs } from '@/modules/meters/components/graphs'
import { ReadingList } from '@/modules/readings/components'

const snapPoints = ['40%', '60%']
export default function Page() {
  const colors = useColors()
  const defaultStyles = useDefaultStyles()

  const { meterId: meterIdRaw } = useLocalSearchParams()
  const meterId = parseInt(meterIdRaw as string)
  const [meter] = useMeterById(meterId)

  const from = useSignal<Date | null>(null)
  const until = useSignal<Date | null>(null)
  const selectedYears = useSignal<string[]>([])

  const [readings] = useReadingsForMeterFiltered(
    meterId,
    from,
    until,
    selectedYears,
  )
  const [yearlyUsages] = useYearlyUsagesForMeter(
    meterId,
    from,
    until,
    selectedYears,
  )

  const [allYears, setAllYears] = useState<string[]>([])
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
    if (newYears.length >= allYears.length) {
      setAllYears(newYears)
    }
  }, [allYears.length, readings])

  const styles = useMemo(
    () =>
      StyleSheet.create({
        headerRow: {
          flexDirection: 'row',
          alignItems: 'center',
          paddingRight: 4,
          gap: 8,
          marginTop: 8,
          marginBottom: 16,
        },
      }),
    [],
  )

  const bottomSheetRef = useRef<BottomSheetModal>(null)

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
            marginBottom: 8,
          }}
        >
          <TouchableOpacity
            style={[
              defaultStyles.ghostButton,
              { backgroundColor: 'transparent' },
            ]}
            onPress={() => bottomSheetRef.current?.present()}
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

        <Link
          href={`/meter/${meterId}/reading`}
          style={[
            defaultStyles.fab,
            {
              marginLeft: 'auto',
              position: 'absolute',
              bottom: 16,
              right: 16,
              width: 48,
              height: 48,
            },
          ]}
          asChild
        >
          <TouchableOpacity>
            <PlusIcon size={24} stroke={colors.onPrimaryContainer} />
          </TouchableOpacity>
        </Link>

        <BottomSheetModal
          ref={bottomSheetRef}
          index={0}
          snapPoints={snapPoints}
          enableDynamicSizing={false}
          backgroundStyle={{ backgroundColor: colors.card }}
          handleIndicatorStyle={{ backgroundColor: colors.text }}
        >
          <BottomSheetScrollView
            style={{ flex: 1, minHeight: 500, paddingHorizontal: 16 }}
          >
            <View
              style={[
                styles.headerRow,
                {
                  marginBottom: 8,
                },
              ]}
            >
              <Text style={defaultStyles.cardTitle}>
                {translate('meters.graphs.filter')}
              </Text>
              <TouchableOpacity
                style={[defaultStyles.ghostButton, { marginLeft: 'auto' }]}
                onPress={() => {
                  from.value = null
                  until.value = null
                  selectedYears.value = []
                  bottomSheetRef.current?.dismiss()
                }}
              >
                <Text style={[defaultStyles.detail, { color: colors.primary }]}>
                  {translate('general.reset')}
                </Text>
              </TouchableOpacity>
            </View>
            <View style={[defaultStyles.row, { marginBottom: 8 }]}>
              <DatePicker
                disabled={!!selectedYears.value.length}
                value={from}
                label={translate('meters.graphs.from')}
              />
              <DatePicker
                disabled={!!selectedYears.value.length}
                value={until}
                label={translate('meters.graphs.until')}
              />
            </View>
            <Text style={defaultStyles.detail}>
              {translate('meters.graphs.yearSelectionTitle')}
            </Text>
            <Text style={defaultStyles.detailSmall}>
              {translate('meters.graphs.yearSelectionTitleHint')}
            </Text>
            <View
              style={[
                defaultStyles.row,
                { flexWrap: 'wrap', paddingVertical: 8, paddingHorizontal: 16 },
              ]}
            >
              {allYears.map((year) => (
                <Button
                  key={year}
                  variant="ghost"
                  onPress={() => {
                    if (selectedYears.peek().includes(year)) {
                      selectedYears.value = selectedYears
                        .peek()
                        .filter((y) => y !== year)
                    } else {
                      selectedYears.value = [...selectedYears.peek(), year]
                    }
                  }}
                  style={{
                    backgroundColor: colors.background,
                    opacity: selectedYears.value.includes(year) ?  1 : 0.4,
                  }}
                >
                  {year}
                </Button>
              ))}
            </View>
          </BottomSheetScrollView>
        </BottomSheetModal>
      </BottomSheetModalProvider>
    </GestureHandlerRootView>
  )
}
