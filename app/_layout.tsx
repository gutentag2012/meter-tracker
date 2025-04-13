import '@/modules/general/loader'
import { SplashScreen, Stack, useRouter, usePathname } from 'expo-router'
import React, { useEffect } from 'react'
import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from '@react-navigation/native'
import { computed, effect, useComputed, useSignalEffect } from '@preact/signals-react'
import { useSettingsTheme } from '@/modules/general/theme'
import { useColors, useDefaultStyles } from '@/modules/general/theme'
import { Button, StatusBar } from '@/modules/general/components'
import { isDatabaseMigrated } from '@/database/db.signals'
import { areSettingsLoaded } from '@/modules/settings/settings.signals'
import * as Notifications from 'expo-notifications'
import { useSignals } from '@preact/signals-react/runtime'
import { translate } from '@/modules/general/translations'
import { HeaderButtons, makeHeaderDialogBackButton } from '@/modules/general/components/header'
import { ActivityIndicator, Text, TouchableOpacity, View } from 'react-native'
import { CheckIcon, PlusIcon } from 'lucide-react-native'
import Toast from 'react-native-toast-message'

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

const meterRouteRegex = /^\/meter\/(\d+)$/

export default function TabLayout() {
  useSignals()
  const router = useRouter()
  const route = usePathname()
  const isMeterRoute = meterRouteRegex.test(route)
  const meterId = parseInt(route.match(meterRouteRegex)?.[1] ?? '0')
  
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

      <Toast
        position="bottom"
        bottomOffset={isMeterRoute && meterId !== 0 ? 72 : 48}
        config={{
          progress: (props) => (
            <View style={{ paddingInline: 8, width: '100%' }}>
              <View
                style={[
                  defaultStyles.row,
                  {
                    borderWidth: 1,
                    borderColor: colors.outline,
                    backgroundColor: colors.card,
                    width: '100%',
                    paddingInline: 16,
                    paddingBlock: 8,
                    borderRadius: 4,
                    gap: 16,
                  },
                ]}
              >
                <ActivityIndicator size="small" />
                <View>
                  <Text style={defaultStyles.detail}>
                    {props.text1}
                  </Text>
                  {props.text2 && <Text style={defaultStyles.detailSmall}>{props.text2}</Text>}
                </View>
                {props?.props?.actions?.map((action: {text: string; onPress: () => void}) => (
                  <Button
                    key={action.text}
                    onPress={action.onPress}
                    style={{ marginLeft: 'auto' }}
                  >
                    {action.text}
                  </Button>
                )) }
              </View>
            </View>
          ),
          success: (props) => (
            <View style={{ paddingInline: 8, width: '100%' }}>
              <View
                style={[
                  defaultStyles.row,
                  {
                    borderWidth: 1,
                    borderColor: colors.outline,
                    backgroundColor: colors.card,
                    width: '100%',
                    paddingInline: 16,
                    paddingBlock: 8,
                    borderRadius: 4,
                    gap: 16,
                  },
                ]}
              >
                <CheckIcon color={colors.positive} />
                <View>
                  <Text style={defaultStyles.detail}>
                    {props.text1}
                  </Text>
                  {props.text2 && <Text style={defaultStyles.detailSmall}>{props.text2}</Text>}
                </View>
              </View>
            </View>
          ),
        }}
      />

      {isMeterRoute && meterId !== 0 && (
        <TouchableOpacity
          onPressIn={() => router.push(`/meter/${meterId}/reading`)}
          style={[
            defaultStyles.fab,
            {
              marginLeft: 'auto',
              position: 'absolute',
              bottom: 16,
              right: 16,
              width: 48,
              height: 48,
            },
          ]}
        >
          <PlusIcon size={24} stroke={colors.onPrimaryContainer} />
        </TouchableOpacity>
      )}
    </ThemeProvider>
  )
}
