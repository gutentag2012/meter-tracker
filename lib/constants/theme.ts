import { Platform, StyleSheet } from 'react-native'
import { useMemo } from 'react'
import { useSettingsTheme } from '@/modules/general/settings/theme.signals'

const colors = {
  light: {
    background: '#f6fafd',
    card: '#edf2f5',
    text: '#171a1a',
    textMuted: '#2f3636',
    textStatic: '#4e5959',
    outline: '#becccc',
    primary: '#0284c7',
    primaryContainer: '#0ea5e9',
    onPrimaryContainer: '#e0f2fe',
    positive: '#059669',
    warning: '#d97706',
    negative: '#dc2626',
  },
  dark: {
    background: '#111415',
    card: '#191C1D',
    text: '#D4D7D8',
    textMuted: '#a0a6a8',
    textStatic: '#7e8385',
    outline: '#494c4d',
    primary: '#0ea5e9',
    primaryContainer: '#075985',
    onPrimaryContainer: '#e0f2fe',
    positive: '#34d399',
    warning: '#fbbf24',
    negative: '#f87171',
  },
}

export const LightColors = colors.light
export const DarkColors = colors.dark

export const ChartColorsLight = [
  '#dc2626',
  '#991b1b',
  '#d97706',
  '#92400e',
  '#65a30d',
  '#3f6212',
  '#0284c7',
  '#075985',
  '#7c3aed',
  '#5b21b6',
]
export const ChartColorsDark = [
  '#f87171',
  '#dc2626',
  '#fbbf24',
  '#d97706',
  '#a3e635',
  '#65a30d',
  '#38bdf8',
  '#0284c7',
  '#a78bfa',
  '#7c3aed',
]

export function useChartColors() {
  const schema = useSettingsTheme()
  return schema === 'light' ? ChartColorsLight : ChartColorsDark
}

export function useColors() {
  const schema = useSettingsTheme()
  return schema === 'light' ? colors.light : colors.dark
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
    [colors]
  )
}
