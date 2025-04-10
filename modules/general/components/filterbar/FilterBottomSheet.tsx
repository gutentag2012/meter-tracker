import { BottomSheetModal, BottomSheetScrollView } from '@gorhom/bottom-sheet'
import { Signal } from '@preact/signals-react'
import { memo, useMemo } from 'react'
import { useColors, useDefaultStyles } from '@/modules/general/theme'
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import { translate } from '@/modules/general/translations'
import { DatePickers } from '@/modules/general/components/filterbar/DatePickers'
import { YearSelects } from '@/modules/general/components/filterbar/YearSelects'

type FilterBottomSheetProps = {
  bottomSheetRef: React.RefObject<BottomSheetModal>
  from: Signal<Date | null>
  until: Signal<Date | null>
  selectedYears: Signal<string[]>
  allYears: Signal<string[]>
}

export const FilterBottomSheet = memo(FilterBottomSheetRaw)

const snapPoints = ['40%', '60%']
function FilterBottomSheetRaw({
                                bottomSheetRef,
                                from,
                                until,
                                selectedYears,
                                allYears,
                              }: FilterBottomSheetProps) {
  const colors = useColors()
  const defaultStyles = useDefaultStyles()

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

  return (
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
        <DatePickers
          from={from}
          until={until}
          selectedYears={selectedYears}
        />
        <Text style={defaultStyles.detail}>
          {translate('meters.graphs.yearSelectionTitle')}
        </Text>
        <Text style={defaultStyles.detailSmall}>
          {translate('meters.graphs.yearSelectionTitleHint')}
        </Text>
        <YearSelects
          allYears={allYears}
          selectedYears={selectedYears}
        />
      </BottomSheetScrollView>
    </BottomSheetModal>
  )
}