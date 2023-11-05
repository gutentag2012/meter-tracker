import React, { type FunctionComponent } from 'react'
import { StyleSheet } from 'react-native'
import { Checkbox, Colors, TouchableOpacity } from 'react-native-ui-lib'
import { Typography } from '../../setupTheme'
import type Building from '../../services/database/entities/building'
import { DEFAULT_BUILDING_ID } from '../../services/database/entities/building'

type Props = {
  building: Building
  selectedBuilding?: number
  setSelectedBuilding?: (buildingId: number) => void
}

export const BuildingSelectEntry: FunctionComponent<Props> = ({
  building,
  setSelectedBuilding,
  selectedBuilding,
}) => {
  const onSelect = () =>
    setSelectedBuilding?.(selectedBuilding !== building.id ? building.id! : DEFAULT_BUILDING_ID)

  return (
    <TouchableOpacity style={styles.container} onPress={onSelect}>
      <Checkbox
        color={Colors.primary}
        value={selectedBuilding === building.id}
        onValueChange={onSelect}
        label={building.name}
      />
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginBottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  value: {
    ...Typography.LabelSmall,
  },
})
