import { TouchableOpacity, View } from 'react-native'
import { Stack } from 'expo-router/stack'
import { translate } from '@/lib/translations/i18n'
import { useRouter } from 'expo-router'
import { XIcon } from 'lucide-react-native'
import { StatusBar } from 'expo-status-bar'
import { useColors, useDefaultStyles } from '@/lib/constants/theme'
import { createMeter } from '@/modules/meters/meters.query'
import { useForm } from '@formsignals/form-react'
import { ZodAdapter } from '@formsignals/validation-adapter-zod'
import { Button } from '@/lib/components/Button'
import { activeBuilding } from '@/modules/buildings/buildings.signals'
import { MeterForm } from '@/modules/meters/components/MeterForm'
import {
  HeaderDialogBackButton,
  makeHeaderDialogBackButton,
} from '@/lib/components/header/HeaderBackButton'
import { HeaderButtons } from '@/lib/components/header/HeaderButtons'

export default function Page() {
  const router = useRouter()
  const colors = useColors()
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
    },
    onSubmit: async (values) => {
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
          title: translate('meters.createModalTitle'),
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

      <MeterForm form={form} />

      <StatusBar />
    </View>
  )
}
