import { StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import { ChevronDownIcon, HouseIcon, PencilIcon, PlusIcon } from 'lucide-react-native'
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

const snapPoints = ['30%', '90%']
export function ActiveBuildingSelector() {
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

  const [allBuildings] = useAllBuildings()
  const [activeBuildingEntity] = useActiveBuilding()

  function getBuildingName(name: string | undefined) {
    return name === 'default' ? translate('buildings.defaultName') : name
  }
  return (
    <BottomSheetModalProvider>
      <TouchableOpacity
        onPress={() => bottomSheetRef.current?.present()}
        style={{
          backgroundColor: colors.card,
          borderRadius: 4,
          marginHorizontal: 16,
          marginBottom: 8,
          marginTop: 16,
          flexDirection: 'row',
          padding: 8,
        }}>
        <View style={{ flex: 1 }} />
        <View style={[defaultStyles.row, { flex: 1 }]}>
          <HouseIcon
            size={defaultStyles.detail.fontSize}
            stroke={colors.text}
            style={{ marginLeft: 'auto' }}
          />
          <Text style={[defaultStyles.detail, { color: colors.text, marginRight: 'auto' }]}>
            {getBuildingName(activeBuildingEntity?.name)}
          </Text>
        </View>
        <View style={{ flex: 1, alignItems: 'flex-end' }}>
          <ChevronDownIcon size={16} stroke={colors.text} />
        </View>
      </TouchableOpacity>

      <BottomSheetModal
        ref={bottomSheetRef}
        index={0}
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

          {allBuildings?.map((building) => (
            <TouchableOpacity
              key={building.id}
              style={[
                defaultStyles.row,
                {
                  height: 42,
                  alignItems: 'center',
                  gap: 0,
                  backgroundColor:
                    building.id === activeBuilding.value ? colors.background : undefined,
                  borderRadius: 4,
                },
              ]}
              onPress={() => {
                activeBuilding.value = building.id
                bottomSheetRef.current?.dismiss()
              }}>
              <Text style={[defaultStyles.bodyText, { marginLeft: 8, marginRight: 'auto' }]}>
                {getBuildingName(building.name)}
              </Text>

              {building.isDefault ? (
                <Text style={[defaultStyles.detailSmall, { padding: 8 }]}>
                  {translate('buildings.defaultMarked')}
                </Text>
              ) : (
                <TouchableOpacity onPress={() => markBuildingAsDefault(building.id)}>
                  <Text
                    style={[
                      defaultStyles.detailSmall,
                      defaultStyles.outlineButton,
                      { marginRight: 8 },
                    ]}>
                    {translate('buildings.markAsDefault')}
                  </Text>
                </TouchableOpacity>
              )}

              <TouchableOpacity style={{ padding: 8 }}>
                <PencilIcon size={defaultStyles.bodyText.fontSize} stroke={colors.textMuted} />
              </TouchableOpacity>
            </TouchableOpacity>
          ))}
        </BottomSheetScrollView>
      </BottomSheetModal>
    </BottomSheetModalProvider>
  )
}
