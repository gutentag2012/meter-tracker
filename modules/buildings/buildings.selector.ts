import { type BuildingsEntity } from '@/buildings/buildings.entity'

import { tableSelector } from '@utils/TableSelector'

export type DetailedBuilding = {
  id: number
  name: string
  address?: string
  notes?: string
  createdAt: number
}

const buildingSelect = tableSelector<BuildingsEntity>(
  {
    id: '',
    name: '',
    address: '',
    notes: '',
    createdAt: '',
  },
  'building',
  ''
)

export const DetailedBuildingSelector = `
          SELECT ${buildingSelect}
          FROM building
          ORDER BY building.name
      `

export const NumberOfMetersConnectedToBuildingSelector = `
          SELECT COUNT(*) as count
          FROM meter
          WHERE meter.building_id = ?
      `

export const DetailedBuildingByIdSelector = `
          SELECT ${buildingSelect}
          FROM building
          WHERE building.id = ?
      `
