import { StatusBar as ExpoStatusBar } from 'expo-status-bar'
import { useSettingsTheme } from '@/modules/general/theme'

export function StatusBar() {
  const theme = useSettingsTheme()
  return <ExpoStatusBar style={theme.value === 'dark' ? 'light' : 'dark'} />
}
