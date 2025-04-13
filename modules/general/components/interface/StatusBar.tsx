import { StatusBar as ExpoStatusBar } from 'expo-status-bar'
import { useColors, useSettingsTheme } from '@/modules/general/theme'
import { useSignals } from '@preact/signals-react/runtime'

export function StatusBar() {
  useSignals()
  const colors = useColors()
  const theme = useSettingsTheme()
  return <ExpoStatusBar backgroundColor={colors.background} style={theme.value === 'dark' ? 'light' : 'dark'} />
}
