import { useSettingsTheme } from '@/modules/general/settings/theme.signals'
import { StatusBar as StatusBarExpo } from 'expo-status-bar'

export function StatusBar() {
  const theme = useSettingsTheme()
  return <StatusBarExpo style={theme === 'dark' ? 'light' : 'dark'} />
}
