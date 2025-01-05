import { signal } from '@preact/signals-react'
import { useFonts } from 'expo-font'
import { useEffect } from 'react'

export const areFontsLoaded = signal(false)

export function useReadyFonts() {
  const [loaded, error] = useFonts({
    'Mona-Black': require('@/assets/fonts/Mona-Sans-Black.ttf'),
    'Mona-Bold': require('@/assets/fonts/Mona-Sans-Bold.ttf'),
    'Mona-ExtraBold': require('@/assets/fonts/Mona-Sans-ExtraBold.ttf'),
    'Mona-Light': require('@/assets/fonts/Mona-Sans-Light.ttf'),
    'Mona-Medium': require('@/assets/fonts/Mona-Sans-Medium.ttf'),
    'Mona-Regular': require('@/assets/fonts/Mona-Sans-Regular.ttf'),
    'Mona-SemiBold': require('@/assets/fonts/Mona-Sans-SemiBold.ttf'),
    'SpaceMono-Regular': require('@/assets/fonts/SpaceMono-Regular.ttf'),
  })

  useEffect(() => {
    areFontsLoaded.value = loaded || !!error
  }, [loaded, error])
}
