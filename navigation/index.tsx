/**
 * If you are not familiar with React Navigation, refer to the "Fundamentals" guide:
 * https://reactnavigation.org/docs/getting-started
 *
 */
import { DarkTheme, DefaultTheme, NavigationContainer } from '@react-navigation/native'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import * as React from 'react'
import { useMemo } from 'react'
import { type ColorSchemeName } from 'react-native'
import { Colors } from 'react-native-ui-lib'
import HomeScreen from '../screens/HomeScreen'
import MeterSummaryScreen from '../screens/MeterSummaryScreen'
import AddContractModal from '@/contracts/components/AddContractModal'
import AddMeasurementModal from '@/measurements/components/AddMeasurementModal'
import AddMeterModal from '@/meters/components/AddMeterModal'

import NotFoundScreen from '../screens/NotFoundScreen'
import SettingsScreen from '../screens/SettingsScreen'
import type { HomeStackParamList, RootStackParamList } from './types'
import LinkingConfiguration from './LinkingConfiguration'
import AddBuildingModal from '@/buildings/components/AddBuildingModal'

export default function Navigation({ colorScheme }: { colorScheme: ColorSchemeName }) {
  const theme = useMemo(
    () => ({
      ...(colorScheme === 'dark' ? DarkTheme : DefaultTheme),
      colors: {
        ...(colorScheme === 'dark' ? DarkTheme : DefaultTheme),
        primary: Colors.primary,
        background: Colors.background,
        card: Colors.surface,
        text: Colors.onSurface,
        border: Colors.outline,
        notification: Colors.error,
      },
    }),
    [colorScheme]
  )

  return (
    <NavigationContainer linking={LinkingConfiguration} theme={theme}>
      <RootNavigator />
    </NavigationContainer>
  )
}

/**
 * A root stack navigator is often used for displaying modals on top of all other content.
 * https://reactnavigation.org/docs/modal
 */
const Stack = createNativeStackNavigator<RootStackParamList>()

function RootNavigator() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="Root" component={HomeNavigator} options={{ headerShown: false }} />

      <Stack.Screen name="NotFound" component={NotFoundScreen} options={{ title: 'Oops!' }} />
    </Stack.Navigator>
  )
}

const HomeStack = createNativeStackNavigator<HomeStackParamList>()

function HomeNavigator() {
  return (
    <HomeStack.Navigator>
      <HomeStack.Group
        screenOptions={{
          headerShown: false,
          animation: 'slide_from_right',
        }}
      >
        <HomeStack.Screen name="Home" component={HomeScreen} />
        <HomeStack.Screen name="SettingsScreen" component={SettingsScreen} />
        <HomeStack.Screen name="MeterSummaryScreen" component={MeterSummaryScreen} />
      </HomeStack.Group>

      <HomeStack.Group
        screenOptions={{
          presentation: 'modal',
          headerShown: false,
          animation: 'slide_from_bottom',
        }}
      >
        <HomeStack.Screen name="AddMeterModal" component={AddMeterModal} />
        <HomeStack.Screen name="AddMeasurementModal" component={AddMeasurementModal} />
        <HomeStack.Screen name="AddContractModal" component={AddContractModal} />
        <HomeStack.Screen name="AddBuildingModal" component={AddBuildingModal} />
      </HomeStack.Group>
    </HomeStack.Navigator>
  )
}
