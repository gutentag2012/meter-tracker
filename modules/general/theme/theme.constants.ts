export const colors = {
  light: {
    background: '#f2f5f7',
    card: '#f6fafd',
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

export const KeyboardToolbarTheme = {
  dark: {
    primary: DarkColors.primary,
    background: DarkColors.card,
    ripple: 'transparent',
    disabled: DarkColors.primaryContainer,
  },
  light: {
    primary: LightColors.primary,
    background: LightColors.card,
    ripple: 'transparent',
    disabled: LightColors.primaryContainer,
  },
}

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
