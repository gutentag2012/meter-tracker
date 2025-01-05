import { useSettingsTheme } from '@/modules/general/theme/theme.signals'
import {
  LightColors,
  DarkColors,
  ChartColorsDark,
  ChartColorsLight,
} from '@/modules/general/theme/theme.constants'
import { useMemo } from 'react'
import { Platform, StyleSheet } from 'react-native'

export function useColors() {
  const theme = useSettingsTheme()
  return theme.value === 'dark' ? DarkColors : LightColors
}

export function useChartColors() {
  const theme = useSettingsTheme()
  return theme.value === 'dark' ? ChartColorsDark : ChartColorsLight
}

// TODO Fix shadow issue on touchable opacity press and fab (in MeterGridItem)
export function useDefaultStyles() {
  const colors = useColors()
  return useMemo(
    () =>
      StyleSheet.create({
        pageHeader: {
          fontFamily: 'Mona-Medium',
          fontSize: 18,
          color: colors.text,
        },
        cardTitle: {
          fontFamily: 'Mona-Bold',
          fontSize: 16,
          color: colors.text,
        },
        bodyText: {
          fontFamily: 'Mona-Regular',
          fontSize: 14,
          color: colors.text,
        },
        detail: {
          fontFamily: 'Mona-Medium',
          fontSize: 12,
          color: colors.textMuted,
          letterSpacing: 0.2,
          lineHeight: 16,
        },
        detailButton: {
          fontFamily: 'Mona-Medium',
          fontSize: 12,
          color: colors.primary,
          letterSpacing: 0.2,
          lineHeight: 16,
        },
        detailSmall: {
          fontFamily: 'Mona-Medium',
          fontSize: 10,
          lineHeight: 12,
          letterSpacing: 0.1,
          color: colors.textStatic,
        },
        iconText: {
          flexDirection: 'row',
          alignItems: 'center',
          gap: 4,
        },
        pageContainer: {
          backgroundColor: colors.background,
          flex: 1,
          paddingHorizontal: 16,
        },
        resetPaddingHorizontal: {
          paddingHorizontal: 0,
        },
        row: {
          flexDirection: 'row',
          alignItems: 'center',
          gap: 8,
        },
        fab: {
          width: 32,
          height: 32,

          // Android
          elevation: 3,
          // iOS
          shadowColor: Platform.OS === 'ios' ? colors.text : undefined,
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.25,
          shadowRadius: 3.84,

          borderRadius: 4,
          backgroundColor: colors.primaryContainer,
          alignItems: 'center',
          justifyContent: 'center',
        },
        ghostButton: {
          color: colors.text,
          paddingHorizontal: 8,
          paddingVertical: 4,
          gap: 4,
          flexDirection: 'row',
          alignItems: 'center',
        },
        outlineButton: {
          borderColor: colors.outline,
          color: colors.text,
          borderWidth: 1,
          borderStyle: 'solid',
          borderRadius: 4,
          paddingHorizontal: 6,
          paddingVertical: 2,
          gap: 4,
          flexDirection: 'row',
          alignItems: 'center',
        },
      } as const),
    [colors],
  )
}
