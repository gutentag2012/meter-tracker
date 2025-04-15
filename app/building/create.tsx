import { View } from 'react-native'
import { Stack } from 'expo-router/stack'
import { useRouter } from 'expo-router'
import { useForm } from '@formsignals/form-react'
import { ZodAdapter } from '@formsignals/validation-adapter-zod'
import { Button } from '@/modules/general/components'
import { makeHeaderDialogBackButton } from '@/modules/general/components/header/HeaderBackButton'
import { HeaderButtons } from '@/modules/general/components/header/HeaderButtons'
import { useDefaultStyles } from '@/modules/general/theme'
import { translate } from '@/modules/general/translations'
import { useSignals } from '@preact/signals-react/runtime'
import React from 'react'
import Toast from 'react-native-toast-message'
import { createBuilding } from '@/modules/buildings'
import { BuildingForm } from '@/modules/buildings/components/BuildingForm'

export default function Page() {
  useSignals()
  const router = useRouter()
  const defaultStyles = useDefaultStyles()

  const form = useForm({
    validatorAdapter: ZodAdapter,
    defaultValues: {
      name: '',
      address: '' as string | undefined,
      notes: '' as string | undefined,
    },
    onSubmit: async (values) => {
      Toast.show({
        type: "progress",
        text1: translate("buildings.toast.creating"),
        autoHide: false,
      })

      await createBuilding(values)
        .then(() => {
          Toast.show({
            type: "success",
            text1: translate("buildings.toast.didCreate"),
          })
          form.reset()
          router.back()
        })
        .catch((err) => {
          Toast.hide()
          console.error(err)
        })
    },
  })

  return (
    <View style={{ flex: 1 }}>
      <Stack.Screen
        options={{
          title: translate('buildings.createModalTitle'),
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

      <BuildingForm form={form} />
    </View>
  )
}
