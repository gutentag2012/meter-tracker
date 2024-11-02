import { ScrollView, Text, TouchableOpacity, View } from 'react-native'
import { Stack } from 'expo-router/stack'
import { formateDate, translate } from '@/lib/translations/i18n'
import { Link, useLocalSearchParams } from 'expo-router'
import {
  CalendarIcon,
  CoinsIcon,
  DiffIcon,
  MinusIcon,
  PlusIcon,
  Settings2Icon,
} from 'lucide-react-native'
import { StatusBar } from 'expo-status-bar'
import { useColors, useDefaultStyles } from '@/lib/constants/theme'
import { useReadingsForMeter } from '@/modules/readings/readings.query'
import { FlashList } from '@shopify/flash-list'
import { format } from 'date-fns'
import { ChangeIndicatorIcon } from '@/lib/components/ChangeIndicatorIcon'
import { ReadingList } from '@/modules/readings/components/ReadingList'

export default function Page() {
  const colors = useColors()
  const defaultStyles = useDefaultStyles()

  return (
    <View style={[defaultStyles.pageContainer]}>
      <Stack.Screen
        options={{
          title: translate('pages.home'),
          headerRight: () => (
            <>
              <Link href='/settings' asChild>
                <TouchableOpacity>
                  <Settings2Icon color={colors.text} />
                </TouchableOpacity>
              </Link>
            </>
          ),
        }}
      />

      <View style={{ height: 240 }}>
        <Text style={defaultStyles.detail}>Graphs</Text>
      </View>

      <ReadingList />

      <TouchableOpacity
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
        ]}>
        <PlusIcon size={24} stroke={colors.onPrimaryContainer} />
      </TouchableOpacity>

      <StatusBar />
    </View>
  )
}
