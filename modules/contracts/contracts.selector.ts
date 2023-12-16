import { type ContractsEntity } from '@/contracts/contracts.entity'

import { tableSelector } from '@utils/TableSelector'

export type DetailedContract = {
  id: number
  name: string
  pricePerUnit: number
  identification?: string
  createdAt?: number
  conversion: number
  thisMonthConsumption: number
  lastMonthConsumption: number
}

const contractSelect = tableSelector<ContractsEntity>(
  {
    id: '',
    name: '',
    pricePerUnit: '',
    identification: '',
    createdAt: '',
    conversion: '',
  },
  'contract',
  ''
)

export type ContractWithValueDatePairs = DetailedContract & {
  thisMonthValueDatePair: string
  lastMonthValueDatePair: string
  beforeLastMonthValueDatePair: string
}

export const DetailedContractSelector = `
          SELECT ${contractSelect}
          FROM contract
          ORDER BY contract.name
      `

export const DetailedContractForBuildingWithValueDatesSelector = `
          SELECT ${contractSelect}, 
                (SELECT measurement.value || '|' || measurement.createdAt FROM meter LEFT JOIN measurement ON meter.id = measurement.meter_id WHERE meter.contract_id = contract.id AND measurement.createdAt <= ? AND measurement.createdAt >= ? ORDER BY measurement.createdAt DESC LIMIT 1) as thisMonthValueDatePair,
                (SELECT measurement.value || '|' || measurement.createdAt FROM meter LEFT JOIN measurement ON meter.id = measurement.meter_id WHERE meter.contract_id = contract.id AND measurement.createdAt <= ? AND measurement.createdAt >= ? ORDER BY measurement.createdAt DESC LIMIT 1) as lastMonthValueDatePair,
                (SELECT measurement.value || '|' || measurement.createdAt FROM meter LEFT JOIN measurement ON meter.id = measurement.meter_id WHERE meter.contract_id = contract.id AND measurement.createdAt <= ? ORDER BY measurement.createdAt DESC LIMIT 1) as beforeLastMonthValueDatePair
          FROM contract
          WHERE contract.id IN (SELECT meter.contract_id FROM meter WHERE meter.building_id = ?) OR (? AND NOT EXISTS(SELECT meter.contract_id FROM meter WHERE meter.contract_id = contract.id))
          ORDER BY contract.name
      `
