import { Stack } from 'expo-router/stack'
import { useColors, useDefaultStyles } from '@/lib/constants/theme'
import { SplashScreen } from 'expo-router'
import { useFonts } from 'expo-font'
import { useEffect } from 'react'
import { areFontsLoaded, isApplicationReady } from '@/modules/general/setup.signals'
import { effect } from '@preact/signals-react'

SplashScreen.preventAutoHideAsync()

effect(() => {
  if (!isApplicationReady.value) {
    return
  }
  SplashScreen.hideAsync()
})

export default function Layout() {
  const colors = useColors()
  const defaultStyles = useDefaultStyles()
  const [loaded, error] = useFonts({
    'Mona-Black': require('../assets/fonts/Mona-Sans-Black.ttf'),
    'Mona-Bold': require('../assets/fonts/Mona-Sans-Bold.ttf'),
    'Mona-ExtraBold': require('../assets/fonts/Mona-Sans-ExtraBold.ttf'),
    'Mona-Light': require('../assets/fonts/Mona-Sans-Light.ttf'),
    'Mona-Medium': require('../assets/fonts/Mona-Sans-Medium.ttf'),
    'Mona-Regular': require('../assets/fonts/Mona-Sans-Regular.ttf'),
    'Mona-SemiBold': require('../assets/fonts/Mona-Sans-SemiBold.ttf'),
    'SpaceMono-Regular': require('../assets/fonts/SpaceMono-Regular.ttf'),
  })

  useEffect(() => {
    areFontsLoaded.value = loaded || !!error
  }, [loaded, error])

  if (!isApplicationReady.value) {
    return null
  }

  return (
    <Stack
      screenOptions={{
        animation: 'slide_from_right',
        headerShadowVisible: false,
        headerStyle: {
          backgroundColor: colors.background,
        },
        headerTintColor: colors.text,
        headerTitleStyle: defaultStyles.pageHeader,
      }}
    />
  )
}
