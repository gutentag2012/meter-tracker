/**
 * If you are not familiar with React Navigation, refer to the "Fundamentals" guide:
 * https://reactnavigation.org/docs/getting-started
 *
 */
import { DarkTheme, DefaultTheme, NavigationContainer } from '@react-navigation/native'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import * as React from 'react'
import { useMemo } from 'react'
import { ColorSchemeName } from 'react-native'
import { Colors } from 'react-native-ui-lib'
import HomeScreen from '../screens/HomeScreen'
import AddContractModal from '../screens/modals/AddContractModal'
import AddMeasurementModal from '../screens/modals/AddMeasurementModal'
import AddMeterModal from '../screens/modals/AddMeterModal'

import NotFoundScreen from '../screens/NotFoundScreen'
import type { HomeStackParamList, RootStackParamList } from '../types'
import LinkingConfiguration from './LinkingConfiguration'

export default function Navigation({ colorScheme }: { colorScheme: ColorSchemeName }) {
  const theme = useMemo(() => ({
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
  }), [colorScheme])

  return (
    <NavigationContainer
      linking={ LinkingConfiguration }
      theme={ theme }
    >
      <RootNavigator />
    </NavigationContainer>
  )
}

/**
 * A root stack navigator is often used for displaying modals on top of all other content.
 * https://reactnavigation.org/docs/modal
 */
const Stack = createNativeStackNavigator<RootStackParamList>()

// TODO Create nested stack navigator for Homescreen

function RootNavigator() {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name='Root'
        component={ HomeNavigator }
        options={ { headerShown: false } }
      />

      <Stack.Screen
        name='NotFound'
        component={ NotFoundScreen }
        options={ { title: 'Oops!' } }
      />
    </Stack.Navigator>
  )
}

const HomeStack = createNativeStackNavigator<HomeStackParamList>()

function HomeNavigator() {
  return (
    <HomeStack.Navigator>
      <HomeStack.Screen
        name='Home'
        component={ HomeScreen }
        options={ { headerShown: false } }
      />

      <HomeStack.Group
        screenOptions={ {
          presentation: 'modal',
          headerShown: false,
          animation: 'slide_from_bottom',
        } }
      >
        <HomeStack.Screen
          name='AddMeterModal'
          component={ AddMeterModal }
        />
        <HomeStack.Screen
          name='AddMeasurementModal'
          component={ AddMeasurementModal }
        />
        <HomeStack.Screen
          name='AddContractModal'
          component={ AddContractModal }
        />
      </HomeStack.Group>
    </HomeStack.Navigator>
  )
}
