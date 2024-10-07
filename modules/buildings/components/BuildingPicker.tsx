import { DEFAULT_BUILDING_ID } from '@/buildings/buildings.constants'
import { detailedBuildings, selectedBuilding } from '@/buildings/buildings.signals'
import { settings } from '@/settings'
import { computed, useSignal } from '@preact/signals-react'
import * as React from 'react'
import DropDownPicker from 'react-native-dropdown-picker'
import { Colors, View } from 'react-native-ui-lib'
import { ApartmentIcon } from '../../../components/icons/ApartmentIcon'
import { CheckCircleIcon } from '../../../components/icons/CheckCircleIcon'
import { ChevronDownIcon } from '../../../components/icons/ChevronDownIcon'
import { ChevronUpIcon } from '../../../components/icons/ChevronUpIcon'
import { t } from '@/i18n'
import { Typography } from '../../../setupTheme'

// TODO Think about multiline labels

const BuildingPickerItems = computed(() => {
  return detailedBuildings.value
    .sort((a, b) => {
      if (a.id === DEFAULT_BUILDING_ID) return -1
      if (b.id === DEFAULT_BUILDING_ID) return 1

      return a.name.localeCompare(b.name)
    })
    .map((building) => ({
      label:
        building.id === DEFAULT_BUILDING_ID ? t('buildings:default_building_name') : building.name,
      value: building.id,
    }))
})

const PICKER_WIDTH = 152

export function BuildingPicker() {
  const open = useSignal(false)

  if (!settings.featureFlagMultipleBuildings.content.value) return null

  return (
    <View
      style={{
        marginTop: 'auto',
        marginBottom: 'auto',
        display: 'flex',
        flexDirection: 'row',
        width: PICKER_WIDTH + 24 + 4,
        alignItems: 'center',
        zIndex: 10,
      }}
    >
      <View style={{ marginRight: 4 }}>
        <ApartmentIcon color={Colors.onBackground} size={24} />
      </View>
      <DropDownPicker
        multiple={false}
        items={BuildingPickerItems.value}
        open={open.value}
        setOpen={(newOpen) => {
          if (typeof newOpen !== 'function') {
            return (open.value = newOpen)
          }
          return (open.value = newOpen(open.peek()))
        }}
        value={selectedBuilding.value}
        setValue={(newValue) => {
          if (typeof newValue !== 'function') {
            return (selectedBuilding.value = newValue)
          }
          return (selectedBuilding.value = newValue(selectedBuilding.peek()))
        }}
        style={{
          minHeight: 32,
          width: PICKER_WIDTH,
          marginRight: 8,

          backgroundColor: Colors.secondaryContainer,

          borderWidth: 0,
        }}
        labelStyle={{
          ...Typography.LabelMedium,
          color: Colors.onSecondaryContainer,
        }}
        dropDownContainerStyle={{
          borderWidth: 1,
          borderColor: Colors.outline,

          backgroundColor: Colors.secondaryContainer,
          width: PICKER_WIDTH,
        }}
        listItemLabelStyle={{
          ...Typography.LabelMedium,
          color: Colors.onSecondaryContainer,
        }}
        listItemContainerStyle={{}}
        ArrowUpIconComponent={() => <ChevronUpIcon color={Colors.onSecondaryContainer} size={16} />}
        ArrowDownIconComponent={() => (
          <ChevronDownIcon color={Colors.onSecondaryContainer} size={16} />
        )}
        TickIconComponent={() => <CheckCircleIcon color={Colors.onSecondaryContainer} size={16} />}
      />
    </View>
  )
}
