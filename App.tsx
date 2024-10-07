import './polyfill'
import './setupColorScheme'
import './setupTheme'
import { FontAwesome } from '@expo/vector-icons'
import { effect, useSignalEffect } from '@preact/signals-react'
import {
  currentlyLoadedResources,
  FONT_RESOURCE,
  I18N_RESOURCE,
  loadedAllResources,
  NOTIFICATION_RESOURCE,
} from '@utils/AppResources'
import { scheduleReminderNotification } from '@utils/NotificationUtils'
import * as Font from 'expo-font'
import { StatusBar } from 'expo-status-bar'
import { GestureHandlerRootView } from 'react-native-gesture-handler'
import { SafeAreaProvider } from 'react-native-safe-area-context'
import useColorScheme from './hooks/useColorScheme'
import Navigation from './navigation'
import i18n from './modules/i18n'
import * as Notifications from 'expo-notifications'
import * as SplashScreen from 'expo-splash-screen'
import { LogBox } from 'react-native'

LogBox.ignoreLogs(['Non-serializable values were found in the navigation state'])

// Keep the splash screen visible while we fetch resources
SplashScreen.preventAutoHideAsync()

effect(() => {})

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
})

scheduleReminderNotification()
  .then(() => {
    currentlyLoadedResources.value |= NOTIFICATION_RESOURCE
  })
  .catch((error) => console.error('[NOTIFICATION]', error))

i18n
  .init()
  .then(() => (currentlyLoadedResources.value |= I18N_RESOURCE))
  .catch((error) => console.error('[I18N]', error))

Font.loadAsync({
  ...FontAwesome.font,
  'space-mono': require('./assets/fonts/SpaceMono-Regular.ttf'),
  'mona-black': require('./assets/fonts/Mona-Sans-Black.ttf'),
  'mona-bold': require('./assets/fonts/Mona-Sans-Bold.ttf'),
  'mona-extraBold': require('./assets/fonts/Mona-Sans-ExtraBold.ttf'),
  'mona-light': require('./assets/fonts/Mona-Sans-Light.ttf'),
  'mona-medium': require('./assets/fonts/Mona-Sans-Medium.ttf'),
  'mona-regular': require('./assets/fonts/Mona-Sans-Regular.ttf'),
  'mona-semiBold': require('./assets/fonts/Mona-Sans-SemiBold.ttf'),
  'mona-ultraLight': require('./assets/fonts/Mona-Sans-UltraLight.ttf'),
})
  .then(() => (currentlyLoadedResources.value |= FONT_RESOURCE))
  .catch((error) => console.error('[FONT]', error))

export default function App() {
  useSignalEffect(() => {
    if (!loadedAllResources.value) {
      return
    }
    console.log('Loaded all resources')

    SplashScreen.hideAsync()
  })

  const colorScheme = useColorScheme()

  if (!loadedAllResources.value) {
    console.log("Skip rendering app, it's not ready yet", loadedAllResources.value)
    return null
  }

  return (
    <SafeAreaProvider>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <Navigation colorScheme={colorScheme} />
      </GestureHandlerRootView>
      <StatusBar />
    </SafeAreaProvider>
  )
}
