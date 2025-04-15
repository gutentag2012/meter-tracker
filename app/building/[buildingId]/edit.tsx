import { Text, View } from 'react-native'
import { Stack } from 'expo-router/stack'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { updateMeter, useMeterById, useMeterResetsById } from '@/modules/meters/meters.query'
import { useForm } from '@formsignals/form-react'
import { ZodAdapter } from '@formsignals/validation-adapter-zod'
import { Button } from '@/modules/general/components/inputs/Button'
import { activeBuilding } from '@/modules/buildings/buildings.signals'
import { MeterForm } from '@/modules/meters/components/MeterForm'
import { makeHeaderDialogBackButton } from '@/modules/general/components/header/HeaderBackButton'
import { HeaderButtons } from '@/modules/general/components/header/HeaderButtons'
import { useDefaultStyles } from '@/modules/general/theme'
import { translate } from '@/modules/general/translations'
import { useSignals } from '@preact/signals-react/runtime'
import { StatusBar } from '@/modules/general/components'
import React, { useMemo } from 'react'
import Toast from 'react-native-toast-message'
import { updateBuilding, useBuildingById } from '@/modules/buildings'
import { BuildingForm } from '@/modules/buildings/components/BuildingForm'

export default function Page() {
  useSignals()
  const router = useRouter()
  const defaultStyles = useDefaultStyles()
  const { buildingId: buildingIdRaw } = useLocalSearchParams()
  const buildingId = parseInt(buildingIdRaw as string)
  const [building] = useBuildingById(buildingId)

  const defaultName = useMemo(() => {
    if(!building) return ''
    if(building.name === "default") return translate("buildings.defaultName")
    return building.name
  }, [building])

  const form = useForm({
    validatorAdapter: ZodAdapter,
    defaultValues: {
      name: defaultName,
      address: building?.address as string | undefined,
      notes: building?.notes as string | undefined,
    },
    onSubmit: async (values) => {
      Toast.show({
        type: "progress",
        text1: translate("buildings.toast.updating"),
        autoHide: false,
      })
      
      await updateBuilding(
        buildingId,
        values
      )
        .then(() => {
          Toast.show({
            type: 'success',
            text1: translate('buildings.toast.didUpdate'),
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
          title: translate('buildings.updateModalTitle'),
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
          presentation: 'fullScreenModal',
        }}
      />

      {building && <BuildingForm form={form} buildingId={buildingId} />}
    </View>
  )
}
