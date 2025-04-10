import '@/modules/general/loader'
import { SplashScreen, Stack } from 'expo-router'
import React from 'react'
import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from '@react-navigation/native'
import { computed, effect, useComputed, useSignalEffect } from '@preact/signals-react'
import { useSettingsTheme } from '@/modules/general/theme'
import { useColors, useDefaultStyles } from '@/modules/general/theme'
import { StatusBar } from '@/modules/general/components'
import { isDatabaseMigrated } from '@/database/db.signals'
import { areSettingsLoaded } from '@/modules/settings/settings.signals'
import * as Notifications from 'expo-notifications'

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
})

SplashScreen.preventAutoHideAsync()

const isApplicationReady = computed(() => isDatabaseMigrated.value && areSettingsLoaded.value)
effect(() => {
    if(!isApplicationReady.value) {
      return
    }
    SplashScreen.hideAsync()
})

export default function TabLayout() {
  const theme = useSettingsTheme()
  const colors = useColors()
  const defaultStyles = useDefaultStyles()

  if (!isApplicationReady.value) {
    return null
  }

  return (
    <ThemeProvider value={theme.value === 'dark' ? DarkTheme : DefaultTheme}>
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
      <StatusBar />
    </ThemeProvider>
  )
}
