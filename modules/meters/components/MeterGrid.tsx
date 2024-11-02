import { StyleSheet, Text, View } from 'react-native'
import { updateMeterOrders, useMetersForBuilding } from '@/modules/meters/meters.query'
import { MeterGridItem } from '@/modules/meters/components/MeterGridItem'
import { LibraryIcon } from 'lucide-react-native'
import { useColors, useDefaultStyles } from '@/lib/constants/theme'
import { translate } from '@/lib/translations/i18n'
import { GestureHandlerRootView } from 'react-native-gesture-handler'
import { useEffect } from 'react'
import { getCellContainerHeight } from '@/modules/meters/meters.constants'
import { useSharedValue } from 'react-native-reanimated'

export function MeterGrid() {
  const colors = useColors()
  const defaultStyles = useDefaultStyles()
  const [meters] = useMetersForBuilding()

  const positions = useSharedValue({} as Record<number, number>)
  useEffect(() => {
    positions.value = meters.reduce(
      (acc, meter, index) => {
        acc[meter.meterId] = index
        return acc
      },
      {} as Record<number, number>
    )
  }, [meters, positions])

  return (
    <GestureHandlerRootView style={{ height: getCellContainerHeight(meters.length) }}>
      {meters.map((meter) => (
        <MeterGridItem
          key={meter.meterId}
          meter={meter}
          positions={positions}
          onFinishSort={() => updateMeterOrders(positions.value)}
        />
      ))}
      {meters.length % 2 === 1 && (
        <View
          style={StyleSheet.flatten([
            {
              flex: 1,
            },
          ])}
        />
      )}
      {meters.length === 0 && (
        <View
          style={{
            alignItems: 'center',
            gap: 8,
            padding: 24,
            backgroundColor: colors.card,
            borderRadius: 8,
            flex: 1,
          }}>
          <LibraryIcon color={colors.textMuted} />
          <Text style={[defaultStyles.detail, { color: colors.textMuted, textAlign: 'center' }]}>
            {translate('meters.emptyList')}
          </Text>
        </View>
      )}
    </GestureHandlerRootView>
  )
}
