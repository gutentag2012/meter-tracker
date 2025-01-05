import { View } from 'react-native'
import { Stack } from 'expo-router/stack'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { useForm } from '@formsignals/form-react'
import { ZodAdapter } from '@formsignals/validation-adapter-zod'
import { Button } from '@/modules/general/components/Button'
import { ReadingForm } from '@/modules/readings/components/ReadingForm'
import {
  updateReading,
  useReadingById,
} from '@/modules/readings/readings.query'
import { makeHeaderDialogBackButton } from '@/modules/general/components/header/HeaderBackButton'
import { HeaderButtons } from '@/modules/general/components/header/HeaderButtons'
import { useMemo } from 'react'
import { useDefaultStyles } from '@/modules/general/theme'
import { translate } from '@/modules/general/translations'

export default function Page() {
  const router = useRouter()
  const defaultStyles = useDefaultStyles()
  const { readingId: readingIdRaw } = useLocalSearchParams()
  const readingId = parseInt(readingIdRaw as string)
  const [reading] = useReadingById(readingId)

  const today = useMemo(() => new Date(), [])

  const form = useForm({
    validatorAdapter: ZodAdapter,
    defaultValues: {
      value: reading?.value ?? 0,
      timestamp: reading?.timestamp ?? today,
      meter: reading?.meterId ?? 1,
    },
    onSubmit: async (values) => {
      await updateReading(readingId, {
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
          title: translate('readings.updateModalTitle'),
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

      <ReadingForm form={form} readingId={readingId} />
    </View>
  )
}
