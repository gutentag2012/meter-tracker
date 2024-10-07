import { DEFAULT_BUILDING_ID } from '@/buildings/buildings.constants'
import { selectedBuilding } from '@/buildings/buildings.signals'
import { EVENT_INVALIDATE_CONTRACTS } from '@/contracts/contracts.constants'
import {
  type ContractWithValueDatePairs,
  type DetailedContract,
  DetailedContractForBuildingWithValueDatesSelector,
  DetailedContractSelector,
} from '@/contracts/contracts.selector'
import { RunOnDB } from '@/database'
import { effect, signal } from '@preact/signals-react'
import { isDatabaseLoaded } from '@utils/AppResources'
import { unflattenObject } from '@utils/DataUtils'
import moment from 'moment'
import EventEmitter from '@/events'

export const allContracts = signal<Array<DetailedContract>>([])
export const contractsForBuilding = signal<Array<ContractWithValueDatePairs>>([])

const mapValueDatePair = (row?: string) => {
  if (!row) {
    return undefined
  }
  const [valueRaw, dateRaw] = row.split('|')
  return {
    value: parseFloat(valueRaw),
    date: parseInt(dateRaw),
  }
}

effect(() => {
  if (!isDatabaseLoaded.value) {
    console.log('[CONTRACTS] Database not loaded, not loading contracts')
    return
  }

  const loadAllContracts = async () => {
    const res = await RunOnDB(DetailedContractSelector)

    allContracts.value = res.rows._array.map(unflattenObject<DetailedContract>)
  }

  const loadContractsForBuilding = async () => {
    const selectedBuildingValue = selectedBuilding.value
    const isDefaultBuildingSelected = selectedBuilding.value === DEFAULT_BUILDING_ID

    const endOfThisMonth = moment().endOf('month').valueOf()
    const endOfLastMonth = moment().subtract(1, 'month').endOf('month').valueOf()
    const endOfBeforeLastMonth = moment().subtract(2, 'month').endOf('month').valueOf()

    // This is used because if we have the default building select we also want to show all contracts, that are not assigned to any meter
    const res = await RunOnDB(DetailedContractForBuildingWithValueDatesSelector, [
      endOfThisMonth,
      endOfLastMonth,
      endOfLastMonth,
      endOfBeforeLastMonth,
      endOfBeforeLastMonth,
      selectedBuildingValue,
      Number(isDefaultBuildingSelected),
    ])

    const daysIntoMonth = moment().date()
    const daysOfLastMonth = moment().subtract(1, 'month').daysInMonth()

    contractsForBuilding.value = res.rows._array
      .map(
        ({
          thisMonthValueDatePair,
          lastMonthValueDatePair,
          beforeLastMonthValueDatePair,
          ...contract
        }: ContractWithValueDatePairs) => {
          const thisMonthValueDate = mapValueDatePair(thisMonthValueDatePair)
          const lastMonthValueDate = mapValueDatePair(lastMonthValueDatePair)
          const beforeLastMonthValueDate = mapValueDatePair(beforeLastMonthValueDatePair)

          contract.thisMonthConsumption = 0
          if (thisMonthValueDate && (lastMonthValueDate || beforeLastMonthValueDate)) {
            const compareEntity = (lastMonthValueDate || beforeLastMonthValueDate)!
            const daysBetween =
              moment(thisMonthValueDate.date)
                .endOf('day')
                .diff(moment(compareEntity.date).startOf('day'), 'days') + 1 // The difference within start and end of day is not counted
            const consumptionPerDay = (thisMonthValueDate.value - compareEntity.value) / daysBetween

            contract.thisMonthConsumption = consumptionPerDay * daysIntoMonth
          }

          contract.lastMonthConsumption = 0
          if ((lastMonthValueDate || thisMonthValueDate) && beforeLastMonthValueDate) {
            const compareEntity = (lastMonthValueDate || thisMonthValueDate)!
            const daysBetween =
              moment(compareEntity.date)
                .endOf('day')
                .diff(moment(beforeLastMonthValueDate.date).startOf('day'), 'days') + 1 // The difference within start and end of day is not counted
            const consumptionPerDay =
              (compareEntity.value - beforeLastMonthValueDate.value) / daysBetween

            contract.lastMonthConsumption = consumptionPerDay * daysOfLastMonth
          }

          return contract
        }
      )
      .map(unflattenObject<ContractWithValueDatePairs>)
  }

  const loadContracts = async () => {
    console.log('[CONTRACTS] Load Data')

    await Promise.all([loadAllContracts(), loadContractsForBuilding()])
  }

  console.log('[CONTRACTS] Initial')
  loadContracts().catch((err) => {
    console.error('[CONTRACTS] Error loading data', err)
  })

  EventEmitter.subscribe(EVENT_INVALIDATE_CONTRACTS, loadContracts)
  return () => EventEmitter.unsubscribe(EVENT_INVALIDATE_CONTRACTS, loadContracts)
})
