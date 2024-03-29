/**
 * Learn more about deep linking with React Navigation
 * https://reactnavigation.org/docs/deep-linking
 * https://reactnavigation.org/docs/configuring-links
 */

import { type LinkingOptions } from '@react-navigation/native'
import * as Linking from 'expo-linking'

import { type RootStackParamList } from './types'

const linking: LinkingOptions<RootStackParamList> = {
  prefixes: [Linking.createURL('/')],
  config: {
    screens: {
      Root: {
        screens: {
          Home: 'Home',
          SettingsScreen: 'SettingsScreen',
          MeterSummaryScreen: 'MeterSummaryScreen',
          AddMeterModal: 'AddMeterModal',
          AddMeasurementModal: 'AddMeasurementModal',
          AddContractModal: 'AddContractModal',
          AddBuildingModal: 'AddBuildingModal',
        },
      },
      NotFound: '*',
    },
  },
}

export default linking
