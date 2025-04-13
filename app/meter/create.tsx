import { View } from 'react-native'
import { Stack } from 'expo-router/stack'
import { useRouter } from 'expo-router'
import { createMeter } from '@/modules/meters/meters.query'
import { useForm } from '@formsignals/form-react'
import { ZodAdapter } from '@formsignals/validation-adapter-zod'
import { Button, StatusBar } from '@/modules/general/components'
import { activeBuilding } from '@/modules/buildings/buildings.signals'
import { MeterForm } from '@/modules/meters/components/MeterForm'
import { makeHeaderDialogBackButton } from '@/modules/general/components/header/HeaderBackButton'
import { HeaderButtons } from '@/modules/general/components/header/HeaderButtons'
import { useDefaultStyles } from '@/modules/general/theme'
import { translate } from '@/modules/general/translations'
import { useSignals } from '@preact/signals-react/runtime'
import React from 'react'
import Toast from 'react-native-toast-message'

export default function Page() {
  useSignals()
  const router = useRouter()
  const defaultStyles = useDefaultStyles()

  const form = useForm({
    validatorAdapter: ZodAdapter,
    defaultValues: {
      name: '',
      identifier: '',
      precision: 2,
      unit: 1,
      meterType: 1,
      customUnitConversion: null as number | null,
      contract: null as number | null,
      resets: [] as {
        id: number
        timestamp: Date
        value: number
        meterId: number
      }[],
    },
    onSubmit: async (values) => {
      Toast.show({
        type: "progress",
        text1: translate("meters.toast.creating"),
        autoHide: false,
      })

      await createMeter({
        name: values.name,
        identifier: values.identifier,
        precision: values.precision,
        typeId: values.meterType,
        unitId: values.unit,
        contractId: values.contract,
        buildingId: activeBuilding.value,
        customUnitConversion: values.customUnitConversion,
      })
        .then(() => {
          Toast.show({
            type: "success",
            text1: translate("meters.toast.didCreate"),
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
          title: translate('meters.createModalTitle'),
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

      <MeterForm form={form} />
    </View>
  )
}
