import { StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import { ChevronDownIcon, FilterIcon, HouseIcon, PencilIcon, PlusIcon } from 'lucide-react-native'
import { useColors, useDefaultStyles } from '@/lib/constants/theme'
import {
  BottomSheetModal,
  BottomSheetModalProvider,
  BottomSheetScrollView,
} from '@gorhom/bottom-sheet'
import { useMemo, useRef } from 'react'
import {
  markBuildingAsDefault,
  useActiveBuilding,
  useAllBuildings,
} from '@/modules/buildings/buildings.query'
import { translate } from '@/lib/translations/i18n'
import { activeBuilding } from '@/modules/buildings/buildings.signals'

const snapPoints = ['50%', '80%']
export function MeterDataFilterButton() {
  const defaultStyles = useDefaultStyles()
  const colors = useColors()

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
    [colors]
  )

  const bottomSheetRef = useRef<BottomSheetModal>(null)

  return (
    <BottomSheetModalProvider>
      <View style={{ flexDirection: 'row', justifyContent: 'flex-end', marginBottom: 8 }}>
        <TouchableOpacity
          style={[defaultStyles.ghostButton, { backgroundColor: 'transparent' }]}
          onPress={() => bottomSheetRef.current?.present()}>
          <FilterIcon size={defaultStyles.detail.fontSize} stroke={colors.primary} />
          <Text style={[defaultStyles.detail, { color: colors.primary }]}>
            {translate('meters.graphs.filter')}
          </Text>
        </TouchableOpacity>
      </View>

      <BottomSheetModal
        ref={bottomSheetRef}
        index={1}
        snapPoints={snapPoints}
        enableDynamicSizing={false}
        backgroundStyle={{ backgroundColor: colors.card }}
        handleIndicatorStyle={{ backgroundColor: colors.text }}>
        <BottomSheetScrollView style={{ flex: 1, minHeight: 500, paddingHorizontal: 16 }}>
          <View
            style={[
              styles.headerRow,
              {
                marginBottom: 8,
              },
            ]}>
            <Text style={defaultStyles.cardTitle}>{translate('buildings.modalTitle')}</Text>
            <TouchableOpacity style={[defaultStyles.ghostButton, { marginLeft: 'auto' }]}>
              <PlusIcon size={defaultStyles.detail.fontSize} stroke={colors.primary} />
              <Text style={[defaultStyles.detail, { color: colors.primary }]}>
                {translate('buildings.createButton')}
              </Text>
            </TouchableOpacity>
          </View>
        </BottomSheetScrollView>
      </BottomSheetModal>
    </BottomSheetModalProvider>
  )
}
