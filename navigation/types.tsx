/**
 * Learn more about using TypeScript with React Navigation:
 * https://reactnavigation.org/docs/typescript/
 */

import { type DetailedBuilding } from '@/buildings/buildings.selector'
import { type DetailedContract } from '@/contracts/contracts.selector'
import { type DetailedMeter } from '@/meters/meters.selector'
import { type NativeStackScreenProps } from '@react-navigation/native-stack'
import { type ReducedMeasurement } from '@/measurements/measurements.selector'

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}

export type RootStackParamList = {
  Root: undefined
  NotFound: undefined
}

export type HomeStackParamList = {
  Home: undefined
  SettingsScreen: undefined
  MeterSummaryScreen: {
    meter: DetailedMeter
  }
  AddMeterModal: {
    editMeter?: DetailedMeter
  }
  AddMeasurementModal: {
    meter?: DetailedMeter
    editMeasurement?: ReducedMeasurement
  }
  AddContractModal: {
    editContract?: DetailedContract
    onEndEditing?: (contract: DetailedContract) => void
  }
  AddBuildingModal: {
    editBuilding?: DetailedBuilding
    onEndEditing?: (buildings: DetailedBuilding) => void
  }
}

export type RootStackScreenProps<Screen extends keyof RootStackParamList> = NativeStackScreenProps<
  RootStackParamList,
  Screen
>

export type HomeStackScreenProps<Screen extends keyof HomeStackParamList> = NativeStackScreenProps<
  HomeStackParamList,
  Screen
>
