import './setupColorScheme'
import './setupTheme'

import { StatusBar } from 'expo-status-bar'
import { useEffect } from 'react'
import { SafeAreaProvider } from 'react-native-safe-area-context'
import { ButtonProps, Colors, ThemeManager } from 'react-native-ui-lib'

import useCachedResources from './hooks/useCachedResources'
import useColorScheme from './hooks/useColorScheme'
import Navigation from './navigation'
import { setupDatabase } from './services/database'
import i18n from './services/i18n'

import { LogBox } from 'react-native';

LogBox.ignoreLogs([
  'Non-serializable values were found in the navigation state',
]);

export default function App() {
  const isLoadingComplete = useCachedResources()
  const colorScheme = useColorScheme()

  useEffect(() => {
    setupDatabase().then(() => console.log('Database setup complete'))

    i18n.init()
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
      .catch((error) => console.warn(error))
  }, [])

  if (!isLoadingComplete) {
    return null
  }

  return (
    <SafeAreaProvider>
      <Navigation colorScheme={ colorScheme } />
      <StatusBar />
    </SafeAreaProvider>
  )
}
