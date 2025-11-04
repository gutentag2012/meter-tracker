import { GestureHandlerRootView } from 'react-native-gesture-handler'
import { Link, Stack, useRouter } from 'expo-router'
import { ActiveBuildingSelector } from '@/modules/buildings/components/ActiveBuildingSelector'
import { translate } from '@/modules/general/translations'
import { useColors, useDefaultStyles } from '@/modules/general/theme'
import {
  HeaderButtonsOnlySettings,
  makeHeaderBackButton,
} from '@/modules/general/components/header'
import { useMemo } from 'react'
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native'
import { PlusIcon } from 'lucide-react-native'
import { MeterGrid } from '@/modules/meters/components'
import { ContractList } from '@/modules/contracts/components'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

export default function HomeScreen() {
  const router = useRouter()
  const colors = useColors()
  const defaultStyles = useDefaultStyles()

  const styles = useMemo(
    () =>
      StyleSheet.create({
        scrollContainer: {
          paddingTop: 8,
          paddingHorizontal: 16,
          flexGrow: 1,
        },
        headerRow: {
          flexDirection: 'row',
          alignItems: 'center',
          paddingRight: 4,
          gap: 8,
          marginBottom: 8,
        },
        sectionSeparator: {
          height: 32,
        },
        pushRight: {
          marginLeft: 'auto',
        },
      }),
    [],
  )

  const margins = useSafeAreaInsets()

  return (
    <GestureHandlerRootView
      style={[
        defaultStyles.pageContainer,
        defaultStyles.resetPaddingHorizontal,
      ]}
    >
      <Stack.Screen
        options={{
          title: translate('pages.home'),
          headerTitleStyle: defaultStyles.pageHeader,
          headerLeft: makeHeaderBackButton(),
          headerRight: HeaderButtonsOnlySettings(),
        }}
      />

      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.headerRow}>
          <TouchableOpacity style={[defaultStyles.ghostButton, styles.pushRight]} onPress={() => router.push('/meter/create')}>
            <PlusIcon
              size={defaultStyles.detail.fontSize}
              stroke={colors.primary}
            />
            <Text style={defaultStyles.detailButton}>
              {translate('meters.createButton')}
            </Text>
          </TouchableOpacity>
        </View>

        <MeterGrid />

        <View style={styles.sectionSeparator} />

        <View style={styles.headerRow}>
          <TouchableOpacity style={[defaultStyles.ghostButton, styles.pushRight]} onPress={() => router.push('/contract/create')}>
            <PlusIcon
              size={defaultStyles.detail.fontSize}
              stroke={colors.primary}
            />
            <Text style={defaultStyles.detailButton}>
              {translate('contracts.createButton')}
            </Text>
          </TouchableOpacity>
        </View>

        <ContractList />
      </ScrollView>

      <View style={{paddingBlock: margins.bottom + 8}}>
        <ActiveBuildingSelector />
      </View>
    </GestureHandlerRootView>
  )
}
