import { View } from 'react-native'
import { Stack } from 'expo-router/stack'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { useForm } from '@formsignals/form-react'
import { ZodAdapter } from '@formsignals/validation-adapter-zod'
import { Button } from '@/modules/general/components/inputs/Button'
import { ReadingForm } from '@/modules/readings/components/ReadingForm'
import {
  updateReading,
  useReadingById,
} from '@/modules/readings/readings.query'
import { makeHeaderDialogBackButton } from '@/modules/general/components/header/HeaderBackButton'
import { HeaderButtons } from '@/modules/general/components/header/HeaderButtons'
import React, { useMemo } from 'react'
import { useDefaultStyles } from '@/modules/general/theme'
import { translate } from '@/modules/general/translations'
import { useSignals } from '@preact/signals-react/runtime'
import { StatusBar } from '@/modules/general/components'
import Toast from 'react-native-toast-message'

export default function Page() {
  useSignals()
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
      Toast.show({
        type: "progress",
        text1: translate("readings.toast.updating"),
        autoHide: false,
      })
      await updateReading(readingId, {
        meterId: values.meter,
        timestamp: values.timestamp,
        value: values.value,
      })
        .then(() => {
          Toast.show({
            type: 'success',
            text1: translate('readings.toast.didUpdate'),
          })
        })
        .catch((err) => {
          Toast.hide()
          console.error(err)
        })
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
              <Button onPressIn={() => form.handleSubmit()} disabled={!form.canSubmit.value}>
                {translate('general.save')}
              </Button>
            </HeaderButtons>
          ),
          animation: 'slide_from_bottom',
        }}
      />

      <ReadingForm form={form} readingId={readingId} />
    </View>
  )
}
