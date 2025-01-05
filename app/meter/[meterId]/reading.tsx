import { View } from 'react-native'
import { Stack } from 'expo-router/stack'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { useForm } from '@formsignals/form-react'
import { ZodAdapter } from '@formsignals/validation-adapter-zod'
import { Button } from '@/modules/general/components/Button'
import { useMemo } from 'react'
import { createReading } from '@/modules/readings/readings.query'
import { makeHeaderDialogBackButton } from '@/modules/general/components/header/HeaderBackButton'
import { HeaderButtons } from '@/modules/general/components/header/HeaderButtons'
import { useDefaultStyles } from '@/modules/general/theme'
import { translate } from '@/modules/general/translations'
import { ReadingForm } from '@/modules/readings/components'

export default function Page() {
  const router = useRouter()
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
              <Button onPress={() => form.handleSubmit()}>
                {translate('general.save')}
              </Button>
            </HeaderButtons>
          ),
          animation: 'slide_from_bottom',
          presentation: 'fullScreenModal',
        }}
      />

      <ReadingForm form={form as any} />
    </View>
  )
}
