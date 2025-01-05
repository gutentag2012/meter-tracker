import { Text } from 'react-native'
import { Stack } from 'expo-router/stack'
import { makeHeaderBackButton } from '@/modules/general/components/header/HeaderBackButton'
import { GestureHandlerRootView } from 'react-native-gesture-handler'
import { useDefaultStyles } from '@/modules/general/theme'

export default function Page() {
  const defaultStyles = useDefaultStyles()

  return (
    <GestureHandlerRootView
      style={[defaultStyles.pageContainer, { paddingHorizontal: 0 }]}
    >
      <Stack.Screen
        options={{
          title: 'Export',
          headerTitleStyle: defaultStyles.pageHeader,
          headerLeft: makeHeaderBackButton(true),
        }}
      />

      <Text style={defaultStyles.detail}>Export</Text>
    </GestureHandlerRootView>
  )
}
