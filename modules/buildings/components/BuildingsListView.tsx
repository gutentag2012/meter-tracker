import { DEFAULT_BUILDING_ID } from '@/buildings/buildings.constants'
import React, { type FC } from 'react'
import { type DetailedBuilding } from '@/buildings/buildings.selector'
import { detailedBuildings } from '@/buildings/buildings.signals'
import { BuildingListEntry } from '@/buildings/components/BuildingListEntry'

type Props = {
  onPress: (building: DetailedBuilding) => void
}

export const BuildingsListView: FC<Props> = ({ onPress }) => {
  return (
    <>
      {detailedBuildings.value
        .filter(({ id }) => id !== DEFAULT_BUILDING_ID)
        .map((building) => (
          <BuildingListEntry
            key={building.id}
            building={building}
            onPress={() => onPress(building)}
          />
        ))}
    </>
  )
}
