import { View } from 'react-native'
import { Stack } from 'expo-router/stack'
import { useRouter } from 'expo-router'
import { useForm } from '@formsignals/form-react'
import { ZodAdapter } from '@formsignals/validation-adapter-zod'
import { Button } from '@/modules/general/components/inputs/Button'
import { activeBuilding } from '@/modules/buildings/buildings.signals'
import { makeHeaderDialogBackButton } from '@/modules/general/components/header/HeaderBackButton'
import { HeaderButtons } from '@/modules/general/components/header/HeaderButtons'
import { createContract } from '@/modules/contracts/contracts.query'
import { useDefaultStyles } from '@/modules/general/theme'
import { translate } from '@/modules/general/translations'
import { ContractForm } from '@/modules/contracts/components'

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
              <Button onPress={() => form.handleSubmit()}>
                {translate('general.save')}
              </Button>
            </HeaderButtons>
          ),
          animation: 'slide_from_bottom',
          presentation: 'fullScreenModal',
        }}
      />

      <ContractForm form={form} />
    </View>
  )
}
