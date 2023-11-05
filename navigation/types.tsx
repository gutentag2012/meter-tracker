/**
 * Learn more about using TypeScript with React Navigation:
 * https://reactnavigation.org/docs/typescript/
 */

import { type NativeStackScreenProps } from '@react-navigation/native-stack'
import type Contract from '../services/database/entities/contract'
import type Measurement from '../services/database/entities/measurement'
import type Meter from '../services/database/entities/meter'
import type Building from '../services/database/entities/building'

declare global {
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
    meter: Meter
  }
  AddMeterModal: {
    editMeter?: Meter
    onEndEditing?: (createdMeter: Meter) => void
  }
  AddMeasurementModal: {
    meter?: Meter
    editMeasurement?: Measurement
    onEndEditing?: (createdMeasurement: Measurement) => void
  }
  AddContractModal: {
    editContract?: Contract
    onEndEditing?: (createdContract: Contract) => void
  }
  AddBuildingModal: {
    editBuilding?: Building
    onEndEditing?: (createdBuilding: Building) => void
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
