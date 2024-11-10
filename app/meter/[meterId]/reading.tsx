import { TouchableOpacity, View } from 'react-native'
import { Stack } from 'expo-router/stack'
import { translate } from '@/lib/translations/i18n'
import { useLocalSearchParams, useRouter } from 'expo-router'
import {
  FlashlightIcon,
  FlashlightOff,
  FlashlightOffIcon,
  PlusIcon,
  SaveIcon,
  XIcon,
} from 'lucide-react-native'
import { StatusBar } from 'expo-status-bar'
import { useColors, useDefaultStyles } from '@/lib/constants/theme'
import { updateMeter, useMeterById } from '@/modules/meters/meters.query'
import { useForm } from '@formsignals/form-react'
import { ZodAdapter } from '@formsignals/validation-adapter-zod'
import { Button } from '@/lib/components/Button'
import { activeBuilding } from '@/modules/buildings/buildings.signals'
import { MeterForm } from '@/modules/meters/components/MeterForm'
import { ReadingForm } from '@/modules/readings/components/ReadingForm'
import { CameraView } from 'expo-camera'
import { useMemo, useState } from 'react'
import { createReading, useLastReadingForDateAndMeter } from '@/modules/readings/readings.query'
import {
  HeaderDialogBackButton,
  makeHeaderDialogBackButton,
} from '@/lib/components/header/HeaderBackButton'
import { HeaderButtons } from '@/lib/components/header/HeaderButtons'

export default function Page() {
  const router = useRouter()
  const colors = useColors()
  const defaultStyles = useDefaultStyles()
  const { meterId: meterIdRaw } = useLocalSearchParams()
  const meterId = parseInt(meterIdRaw as string)

  const today = useMemo(() => new Date(), [])

  const form = useForm({
    validatorAdapter: ZodAdapter,
    defaultValues: {
      value: 0,
      timestamp: today,
      meter: meterId,
    },
    onSubmit: async (values) => {
      await createReading({
        meterId: values.meter,
        timestamp: values.timestamp,
        value: values.value,
      }).catch((err) => console.error(err))
      form.reset()
      router.back()
    },
  })

  return (
    <View style={{ flex: 1 }}>
      <Stack.Screen
        options={{
          title: translate('readings.createModalTitle'),
          headerTitleStyle: defaultStyles.pageHeader,
          headerLeft: makeHeaderDialogBackButton(true),
          headerRight: () => (
            <HeaderButtons hideSettings>
              <Button onPress={() => form.handleSubmit()}>{translate('general.save')}</Button>
            </HeaderButtons>
          ),
          animation: 'slide_from_bottom',
          presentation: 'fullScreenModal',
        }}
      />

      <ReadingForm form={form as any} />

      <StatusBar />
    </View>
  )
}
