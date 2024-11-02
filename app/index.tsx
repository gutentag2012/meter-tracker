import { StatusBar } from 'expo-status-bar'

import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import { Stack } from 'expo-router/stack'
import { translate } from '@/lib/translations/i18n'
import { useColors, useDefaultStyles } from '@/lib/constants/theme'
import { PlusIcon, Settings2Icon } from 'lucide-react-native'
import { MeterGrid } from '@/modules/meters/components/MeterGrid'
import { Link } from 'expo-router'
import { useMemo } from 'react'
import { ContractList } from '@/modules/contracts/components/ContractList'
import { ActiveBuildingSelector } from '@/modules/buildings/components/ActiveBuildingSelector'
import { GestureHandlerRootView } from 'react-native-gesture-handler'
import { useSeed } from '@/database/seed'

export default function App() {
  const defaultStyles = useDefaultStyles()
  const colors = useColors()

  const styles = useMemo(
    () =>
      StyleSheet.create({
        headerRow: {
          flexDirection: 'row',
          alignItems: 'center',
          paddingRight: 4,
          gap: 8,
          marginBottom: 8,
        },
      } as const),
    [colors]
  )

  // useSeed()

  return (
    <GestureHandlerRootView style={[defaultStyles.pageContainer, { paddingHorizontal: 0 }]}>
      <Stack.Screen
        options={{
          title: translate('pages.home'),
          headerRight: () => (
            <>
              <Link href='/settings' asChild>
                <TouchableOpacity>
                  <Settings2Icon color={colors.text} />
                </TouchableOpacity>
              </Link>
            </>
          ),
        }}
      />

      <ScrollView contentContainerStyle={[{ paddingTop: 8, paddingHorizontal: 16, flexGrow: 1 }]}>
        <View
          style={[
            styles.headerRow,
            {
              marginBottom: 8,
            },
          ]}>
          <TouchableOpacity style={[defaultStyles.ghostButton, { marginLeft: 'auto' }]}>
            <PlusIcon size={defaultStyles.detail.fontSize} stroke={colors.primary} />
            <Text style={[defaultStyles.detail, { color: colors.primary }]}>
              {translate('meters.createButton')}
            </Text>
          </TouchableOpacity>
        </View>

        <MeterGrid />

        <View
          style={[
            styles.headerRow,
            {
              marginTop: 32,
              marginBottom: 8,
            },
          ]}>
          <TouchableOpacity style={[defaultStyles.ghostButton, { marginLeft: 'auto' }]}>
            <PlusIcon size={defaultStyles.detail.fontSize} stroke={colors.primary} />
            <Text style={[defaultStyles.detail, { color: colors.primary }]}>
              {translate('contracts.createButton')}
            </Text>
          </TouchableOpacity>
        </View>

        <ContractList />
      </ScrollView>

      <ActiveBuildingSelector />

      <StatusBar />
    </GestureHandlerRootView>
  )
}
