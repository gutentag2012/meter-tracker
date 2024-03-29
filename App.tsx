import './polyfill'
import './setupColorScheme'
import './setupTheme'

import { StatusBar } from 'expo-status-bar'
import { useEffect, useState } from 'react'
import { GestureHandlerRootView } from 'react-native-gesture-handler'
import { SafeAreaProvider } from 'react-native-safe-area-context'

import useCachedResources from './hooks/useCachedResources'
import useColorScheme from './hooks/useColorScheme'
import Navigation from './navigation'
import { setupDatabase } from './services/database'
import i18n from './services/i18n'

import { LogBox } from 'react-native'

LogBox.ignoreLogs(['Non-serializable values were found in the navigation state'])

export default function App() {
  const isLoadingComplete = useCachedResources()
  const colorScheme = useColorScheme()

  // TODO Do all of this in the splash screen
  const [isLoaded, setIsLoaded] = useState(false)

  useEffect(() => {
    Promise.all([
      setupDatabase().then(() => console.log('Database setup complete')),
      i18n.init().catch((error) => console.warn(error)),
    ]).then(() => setIsLoaded(true))

    // i18n.init()
    // .then(() => {
    //   const RNDir = RNI18nManager.isRTL ? 'RTL' : 'LTR';
    //   // RN doesn't always correctly identify native
    //   // locale direction, so we force it here.
    //   if (i18n.dir !== RNDir) {
    //     const isLocaleRTL = i18n.dir === 'RTL';
    //     RNI18nManager.forceRTL(isLocaleRTL);
    //     // RN won't set the layout direction if we
    //     // don't restart the app's JavaScript.
    //     Updates.reloadFromCache();
    //   }
    // })
    // .catch((error) => console.warn(error))
  }, [])

  if (!isLoadingComplete || !isLoaded) {
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
