import { Text, TouchableOpacity, View } from 'react-native'
import { Stack } from 'expo-router/stack'
import { Href, Link, useLocalSearchParams } from 'expo-router'
import { PencilIcon, PlusIcon, Settings2Icon } from 'lucide-react-native'
import { StatusBar } from 'expo-status-bar'
import { useColors, useDefaultStyles } from '@/lib/constants/theme'
import { ReadingList } from '@/modules/readings/components/ReadingList'
import { Button } from '@/lib/components/Button'
import { useMeterById } from '@/modules/meters/meters.query'
import {
  HeaderBackButton,
  makeHeaderBackButton,
  makeHeaderDialogBackButton,
} from '@/lib/components/header/HeaderBackButton'
import {
  HeaderButtonsOnlySettings,
  HeaderButtonsWithEdit,
} from '@/lib/components/header/HeaderButtons'

export default function Page() {
  const colors = useColors()
  const defaultStyles = useDefaultStyles()
  const { meterId } = useLocalSearchParams()
  const [meter] = useMeterById(parseInt(meterId as string))

  return (
    <View style={[defaultStyles.pageContainer]}>
      <Stack.Screen
        options={{
          title: meter?.name || '',
          headerTitleStyle: defaultStyles.pageHeader,
          headerLeft: makeHeaderBackButton(true),
          headerRight: HeaderButtonsWithEdit(`/meter/${meterId}/edit` as Href<string>),
        }}
      />

      <View
        style={{
          height: 240,
          backgroundColor: colors.card,
          borderRadius: 4,
          padding: 8,
        }}>
        <Text style={defaultStyles.detail}>Usage per day</Text>
      </View>

      <Text style={[defaultStyles.cardTitle, { textAlign: 'center' }]}>...</Text>

      <ReadingList />

      <Link
        href={`/meter/${meterId}/reading`}
        style={[
          defaultStyles.fab,
          {
            marginLeft: 'auto',
            position: 'absolute',
            bottom: 16,
            right: 16,
            width: 48,
            height: 48,
          },
        ]}
        asChild>
        <TouchableOpacity>
          <PlusIcon size={24} stroke={colors.onPrimaryContainer} />
        </TouchableOpacity>
      </Link>

      <StatusBar />
    </View>
  )
}
