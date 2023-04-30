/**
 * Learn more about using TypeScript with React Navigation:
 * https://reactnavigation.org/docs/typescript/
 */

import { NativeStackScreenProps } from '@react-navigation/native-stack'
import Meter from './services/database/entities/meter'

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
  AddMeterModal: undefined;
  AddMeasurementModal: {
    meter?: Meter
  };
  AddContractModal: undefined;
};

export type RootStackScreenProps<Screen extends keyof RootStackParamList> = NativeStackScreenProps<
  RootStackParamList,
  Screen
>;

export type HomeStackScreenProps<Screen extends keyof HomeStackParamList> = NativeStackScreenProps<
  HomeStackParamList,
  Screen
>;
