import { View } from 'react-native'
import { Stack } from 'expo-router/stack'
import { translate } from '@/lib/translations/i18n'
import { useRouter } from 'expo-router'
import { StatusBar } from 'expo-status-bar'
import { useDefaultStyles } from '@/lib/constants/theme'
import { useForm } from '@formsignals/form-react'
import { ZodAdapter } from '@formsignals/validation-adapter-zod'
import { Button } from '@/lib/components/Button'
import { activeBuilding } from '@/modules/buildings/buildings.signals'
import { makeHeaderDialogBackButton } from '@/lib/components/header/HeaderBackButton'
import { HeaderButtons } from '@/lib/components/header/HeaderButtons'
import { ContractForm } from '@/modules/contracts/components/ContractForm'
import { createContract } from '@/modules/contracts/contracts.query'

export default function Page() {
  const router = useRouter()
  const defaultStyles = useDefaultStyles()

  const form = useForm({
    validatorAdapter: ZodAdapter,
    defaultValues: {
      contract: {
        name: '',
        identifier: '',
        buildingId: activeBuilding.value,
        unitId: 1,
      },
      contractRevision: {
        pricePerUnit: null as never as number,
        basePayment: null as number | null,
        monthlyPayment: null as number | null,
        startDate: null as never as Date,
        endDate: null as Date | null,
      },
    },
    onSubmit: (values) =>
      createContract(values)
        .then(() => {
          form.reset()
          router.back()
        })
        .catch((err) => console.error(err)),
  })

  return (
    <View style={{ flex: 1 }}>
      <Stack.Screen
        options={{
          title: translate('contracts.createModalTitle'),
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

      <ContractForm form={form} />

      <StatusBar />
    </View>
  )
}
