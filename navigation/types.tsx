/**
 * Learn more about using TypeScript with React Navigation:
 * https://reactnavigation.org/docs/typescript/
 */

import { NativeStackScreenProps } from '@react-navigation/native-stack'
import Contract from '../services/database/entities/contract'
import Measurement from '../services/database/entities/measurement'
import Meter from '../services/database/entities/meter'

declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}

export type RootStackParamList = {
  Root: undefined;
  NotFound: undefined;
};

export type HomeStackParamList = {
  Home: undefined;
  SettingsScreen: undefined;
  MeterSummaryScreen: {
    meter: Meter
  };
  AddMeterModal: {
    editMeter?: Meter
    onEndEditing?: () => void
  };
  AddMeasurementModal: {
    meter?: Meter
    editMeasurement?: Measurement
    onEndEditing?: () => void
  };
  AddContractModal: {
    editContract?: Contract
    onEndEditing?: () => void
  };
};

export type RootStackScreenProps<Screen extends keyof RootStackParamList> = NativeStackScreenProps<
  RootStackParamList,
  Screen
>;

export type HomeStackScreenProps<Screen extends keyof HomeStackParamList> = NativeStackScreenProps<
  HomeStackParamList,
  Screen
>;
