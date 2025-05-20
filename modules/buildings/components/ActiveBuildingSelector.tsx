import { StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import {
  ChevronDownIcon,
  HouseIcon,
  PencilIcon,
  PlusIcon,
} from 'lucide-react-native'
import {
  BottomSheetBackdrop,
  BottomSheetModal,
  BottomSheetModalProvider,
  BottomSheetScrollView,
} from '@gorhom/bottom-sheet'
import { useCallback, useMemo, useRef } from 'react'
import {
  markBuildingAsDefault,
  useActiveBuilding,
  useAllBuildings,
} from '@/modules/buildings/buildings.query'
import { activeBuilding } from '@/modules/buildings/buildings.signals'
import { useColors, useDefaultStyles } from '@/modules/general/theme'
import { translate } from '@/modules/general/translations'
import { useSignals } from '@preact/signals-react/runtime'
import { useRouter } from 'expo-router'

function getBuildingName(name: string | undefined) {
  return name === 'default' ? translate('buildings.defaultName') : name
}

const snapPoints = ['30%', '90%']

export function ActiveBuildingSelector() {
  const router = useRouter()
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

  const bottomSheetRef = useRef<BottomSheetModal>(null)
  const renderBackdrop = useCallback(
    (props: any) => (
      <BottomSheetBackdrop
        {...props}
        onPress={() => bottomSheetRef.current?.dismiss()}
        disappearsOnIndex={-1}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
        }}
      />
    ),
    [],
  )

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
        }}
      >
        <View style={{ flex: 1 }} />
        <View style={[defaultStyles.row, { flex: 1 }]}>
          <HouseIcon
            size={defaultStyles.detail.fontSize}
            stroke={colors.text}
            style={{ marginLeft: 'auto' }}
          />
          <ActiveBuildingName />
        </View>
        <View style={{ flex: 1, alignItems: 'flex-end' }}>
          <ChevronDownIcon size={16} stroke={colors.text} />
        </View>
      </TouchableOpacity>

      <BottomSheetModal
        ref={bottomSheetRef}
        backdropComponent={renderBackdrop}
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
              {translate('buildings.modalTitle')}
            </Text>
            <TouchableOpacity
              style={[defaultStyles.ghostButton, { marginLeft: 'auto' }]}
              onPress={() => {
                bottomSheetRef.current?.dismiss()
                router.push('/building/create')
              }}
            >
              <PlusIcon
                size={defaultStyles.detail.fontSize}
                stroke={colors.primary}
              />
              <Text style={[defaultStyles.detail, { color: colors.primary }]}>
                {translate('buildings.createButton')}
              </Text>
            </TouchableOpacity>
          </View>

          <BuildingList bottomSheetRef={bottomSheetRef} />
        </BottomSheetScrollView>
      </BottomSheetModal>
    </BottomSheetModalProvider>
  )
}

function ActiveBuildingName() {
  useSignals()
  const colors = useColors()
  const defaultStyles = useDefaultStyles()
  const [activeBuildingEntity] = useActiveBuilding()

  return (
    <Text
      style={[
        defaultStyles.detail,
        { color: colors.text, marginRight: 'auto' },
      ]}
    >
      {getBuildingName(activeBuildingEntity?.name)}
    </Text>
  )
}

type BuildingListProps = {
  bottomSheetRef: React.RefObject<BottomSheetModal>
}

function BuildingList({ bottomSheetRef }: BuildingListProps) {
  useSignals()
  const router = useRouter()
  const colors = useColors()
  const defaultStyles = useDefaultStyles()

  const [allBuildings] = useAllBuildings()

  return (
    <View>
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
                building.id === activeBuilding.value
                  ? colors.background
                  : undefined,
              borderRadius: 4,
            },
          ]}
          onPress={() => {
            activeBuilding.value = building.id
            bottomSheetRef.current?.dismiss()
          }}
        >
          <View style={{
            marginLeft: 8, marginRight: 'auto'
          }}>
            <Text
              style={defaultStyles.bodyText}
            >
              {getBuildingName(building.name)}
            </Text>
            <Text
              style={defaultStyles.detail}
            >
              {building.address}
            </Text>
          </View>

          {building.isDefault ? (
            <Text style={[defaultStyles.detailSmall, { padding: 8 }]}>
              {translate('buildings.defaultMarked')}
            </Text>
          ) : (
            <TouchableOpacity
              onPress={() => markBuildingAsDefault(building.id)}
            >
              <Text
                style={[
                  defaultStyles.detailSmall,
                  defaultStyles.outlineButton,
                  { marginRight: 8 },
                ]}
              >
                {translate('buildings.markAsDefault')}
              </Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity
            style={{ padding: 8 }}
            onPress={() => {
              bottomSheetRef.current?.dismiss()
              router.push(`/building/${building.id}/edit`)
            }}
          >
            <PencilIcon
              size={defaultStyles.bodyText.fontSize}
              stroke={colors.textMuted}
            />
          </TouchableOpacity>
        </TouchableOpacity>
      ))}
    </View>
  )
}
