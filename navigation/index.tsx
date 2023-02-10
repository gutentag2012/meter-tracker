/**
 * If you are not familiar with React Navigation, refer to the "Fundamentals" guide:
 * https://reactnavigation.org/docs/getting-started
 *
 */
import { FontAwesome } from '@expo/vector-icons'
import { DarkTheme, DefaultTheme, NavigationContainer } from '@react-navigation/native'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import * as React from 'react'
import { useMemo } from 'react'
import { ColorSchemeName, Pressable } from 'react-native'
import { Colors } from 'react-native-ui-lib'
import HomeScreen from '../screens/HomeScreen'
import AddMeterModal from '../screens/modals/AddMeterModal'

import NotFoundScreen from '../screens/NotFoundScreen'
import type { RootStackParamList, RootStackScreenProps } from '../types'
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
        component={ HomeScreen }
        options={ ({ /*navigation*/ }: RootStackScreenProps<'Root'>) => ({
          title: 'Tab One',
          headerRight: () => (
            <Pressable
              onPress={ () => console.log("navigation.navigate('settings')") }
              style={ ({ pressed }) => ({
                opacity: pressed ? 0.5 : 1,
              }) }
            >
              <FontAwesome
                name='info-circle'
                size={ 25 }
                color={ Colors.$textDefault }
                style={ { marginRight: 15 } }
              />
            </Pressable>
          ),
        }) }
      />

      <Stack.Screen
        name='NotFound'
        component={ NotFoundScreen }
        options={ { title: 'Oops!' } }
      />

      <Stack.Group screenOptions={ { presentation: 'modal' } }>
        <Stack.Screen
          name='AddMeterModal'
          component={ AddMeterModal }
          options={{ headerShown: false, animation: "slide_from_bottom" }}
        />
      </Stack.Group>
    </Stack.Navigator>
  )
}
