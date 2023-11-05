import * as React from 'react'
import { type Dispatch, type SetStateAction, useMemo, useState } from 'react'
import type Building from '../services/database/entities/building'
import { DEFAULT_BUILDING_ID } from '../services/database/entities/building'
import { t } from '../services/i18n'
import { Colors, View } from 'react-native-ui-lib'
import { ApartmentIcon } from '../components/icons/ApartmentIcon'
import DropDownPicker from 'react-native-dropdown-picker'
import { Typography } from '../setupTheme'
import { ChevronUpIcon } from '../components/icons/ChevronUpIcon'
import { ChevronDownIcon } from '../components/icons/ChevronDownIcon'
import { CheckCircleIcon } from '../components/icons/CheckCircleIcon'

export function BuildingPicker(props: {
  value: number
  setValue: Dispatch<SetStateAction<number>>
  buildings: Array<Building>
}) {
  const [open, setOpen] = useState(false)

  const pickerItems = useMemo(
    () =>
      props.buildings
        .sort((a, b) =>
          a.id === DEFAULT_BUILDING_ID
            ? -1
            : b.id === DEFAULT_BUILDING_ID
            ? 1
            : a.name.localeCompare(b.name)
        )
        .map((building) => ({
          label:
            building.id === DEFAULT_BUILDING_ID
              ? t('buildings:default_building_name')
              : building.name,
          value: building.id,
        })),
    [props.buildings]
  )

  return (
    <View
      style={{
        marginTop: 'auto',
        marginBottom: 'auto',
        display: 'flex',
        flexDirection: 'row',
        width: 120 + 24 + 4,
        alignItems: 'center',
        zIndex: 10,
      }}
    >
      <View style={{ marginRight: 4 }}>
        <ApartmentIcon color={Colors.onBackground} size={24} />
      </View>
      <DropDownPicker
        multiple={false}
        items={pickerItems}
        open={open}
        setOpen={setOpen}
        value={props.value}
        setValue={props.setValue}
        style={{
          minHeight: 32,
          height: 32,
          borderWidth: 0,

          width: 120,
          marginRight: 8,
          backgroundColor: Colors.secondaryContainer,
        }}
        labelStyle={{
          ...Typography.LabelLarge,
          color: Colors.onSecondaryContainer,
        }}
        dropDownContainerStyle={{
          borderWidth: 0,

          backgroundColor: Colors.secondaryContainer,
          width: 120,
        }}
        listItemLabelStyle={{
          ...Typography.LabelLarge,
          color: Colors.onSecondaryContainer,
        }}
        ArrowUpIconComponent={() => <ChevronUpIcon color={Colors.onSecondaryContainer} size={16} />}
        ArrowDownIconComponent={() => (
          <ChevronDownIcon color={Colors.onSecondaryContainer} size={16} />
        )}
        TickIconComponent={() => <CheckCircleIcon color={Colors.onSecondaryContainer} size={16} />}
      />
    </View>
  )
}
