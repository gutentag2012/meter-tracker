import { View } from 'react-native'
import { Stack } from 'expo-router/stack'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { updateMeter, useMeterById } from '@/modules/meters/meters.query'
import { useForm } from '@formsignals/form-react'
import { ZodAdapter } from '@formsignals/validation-adapter-zod'
import { Button } from '@/modules/general/components/Button'
import { activeBuilding } from '@/modules/buildings/buildings.signals'
import { MeterForm } from '@/modules/meters/components/MeterForm'
import { makeHeaderDialogBackButton } from '@/modules/general/components/header/HeaderBackButton'
import { HeaderButtons } from '@/modules/general/components/header/HeaderButtons'
import { useDefaultStyles } from '@/modules/general/theme'
import { translate } from '@/modules/general/translations'

export default function Page() {
  const router = useRouter()
  const defaultStyles = useDefaultStyles()
  const { meterId: meterIdRaw } = useLocalSearchParams()
  const meterId = parseInt(meterIdRaw as string)
  const [meter] = useMeterById(meterId)

  const form = useForm({
    validatorAdapter: ZodAdapter,
    defaultValues: {
      name: meter?.name ?? '',
      identifier: meter?.identifier ?? '',
      precision: meter?.precision ?? 2,
      unit: meter?.unitId ?? 1,
      meterType: meter?.typeId ?? 1,
      contract: meter?.contractId ?? null,
      customUnitConversion: meter?.customUnitConversion ?? null,
    },
    onSubmit: async (values) => {
      await updateMeter(meterId, {
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
          form.reset()
          router.back()
        })
        .catch((err) => console.error(err))
    },
  })

  return (
    <View style={{ flex: 1 }}>
      <Stack.Screen
        options={{
          title: translate('meters.updateModalTitle'),
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

      {meter && <MeterForm form={form} meterId={meterId} />}
    </View>
  )
}
