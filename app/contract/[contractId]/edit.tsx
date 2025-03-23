import { View } from 'react-native'
import { Stack } from 'expo-router/stack'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { useFieldGroup, useForm } from '@formsignals/form-react'
import { ZodAdapter } from '@formsignals/validation-adapter-zod'
import { activeBuilding } from '@/modules/buildings/buildings.signals'
import { makeHeaderDialogBackButton } from '@/modules/general/components/header/HeaderBackButton'
import { HeaderButtons } from '@/modules/general/components/header/HeaderButtons'
import {
  createContractRevision,
  updateContract,
  updateContractRevision,
  useAllContractRevisionsForContract,
  useContractById,
} from '@/modules/contracts/contracts.query'
import { ContractForm } from '@/modules/contracts/components/ContractForm'
import { useEffect } from 'react'
import { useSignal } from '@preact/signals-react'
import { Button } from '@/modules/general/components/inputs/Button'
import { useDefaultStyles } from '@/modules/general/theme'
import { translate } from '@/modules/general/translations'

export default function Page() {
  const router = useRouter()
  const defaultStyles = useDefaultStyles()
  const { contractId: contractIdRaw } = useLocalSearchParams()
  const contractId = parseInt(contractIdRaw as string)
  const [contract] = useContractById(contractId)

  const selectedContractRevision = useSignal(contract?.contractRevision?.id)
  useEffect(() => {
    selectedContractRevision.value = contract?.contractRevision?.id
  }, [contract, selectedContractRevision])

  const [contractRevisions] = useAllContractRevisionsForContract(contractId)
  const indexOfSelectedRevision = contractRevisions.findIndex(
    (rev) => rev.id === selectedContractRevision.value,
  )
  const selectedRevision = contractRevisions[indexOfSelectedRevision]
  const maxDateRevisions = contractRevisions.reduce(
    (max, rev) => {
      max ??= rev.startDate
      if (max < rev.startDate) max = rev.startDate
      if (rev.endDate && max < rev.endDate) max = rev.endDate
      return max
    },
    undefined as undefined | Date,
  )

  const form = useForm({
    validatorAdapter: ZodAdapter,
    defaultValues: {
      contract: {
        name: contract?.contract?.name ?? '',
        identifier: contract?.contract?.identifier ?? '',
        buildingId: contract?.contract?.buildingId ?? activeBuilding.value,
        unitId: contract?.contract?.unitId ?? 1,
      },
      contractRevision: {
        pricePerUnit:
          selectedRevision?.pricePerUnit ?? (null as never as number),
        basePayment:
          selectedRevision?.basePayment ?? (null as never as number | null),
        monthlyPayment:
          selectedRevision?.monthlyPayment ?? (null as never as number | null),
        startDate: selectedRevision?.startDate ?? (null as never as Date),
        endDate: selectedRevision?.endDate ?? (null as never as Date | null),
      },
    },
  })
  const baseData = useFieldGroup(
    form,
    [
      'contract.name',
      'contract.identifier',
      'contract.buildingId',
      'contract.unitId',
    ],
    {
      onSubmit: (values) => updateContract(contractId, values.contract),
    },
  )
  const revisionData = useFieldGroup(
    form,
    [
      'contractRevision.pricePerUnit',
      'contractRevision.basePayment',
      'contractRevision.monthlyPayment',
      'contractRevision.startDate',
      'contractRevision.endDate',
    ],
    {
      onSubmit: async (values) => {
        const revisionId = selectedContractRevision.peek()
        if (!revisionId)
          await createContractRevision({
            ...values.contractRevision,
            contractId,
          })
        else await updateContractRevision(revisionId, values.contractRevision)
      },
    },
  )

  const onSubmit = async () => {
    if (baseData.isDirty.peek()) await baseData.handleSubmit()
    if (revisionData.isDirty.peek()) await revisionData.handleSubmit()
    router.back()
  }

  return (
    <View style={{ flex: 1 }}>
      <Stack.Screen
        options={{
          title: translate('contracts.updateModalTitle'),
          headerTitleStyle: defaultStyles.pageHeader,
          headerLeft: makeHeaderDialogBackButton(true),
          headerRight: () => (
            <HeaderButtons hideSettings>
              <Button onPress={onSubmit}>{translate('general.save')}</Button>
            </HeaderButtons>
          ),
          animation: 'slide_from_bottom',
          presentation: 'fullScreenModal',
        }}
      />

      {contract && (
        <ContractForm
          form={form}
          contractId={contractId}
          onSubmit={onSubmit}
          maxDateRevisions={maxDateRevisions}
          revisionIds={contractRevisions.map((r) => r.id)}
          selectedRevision={indexOfSelectedRevision}
          selectedRevisionId={selectedContractRevision}
          revisionSectionSaveAction={
            revisionData.isDirty.value && (() => revisionData.handleSubmit())
          }
          revisionSectionCancelAction={
            revisionData.isDirty.value && (() => revisionData.reset())
          }
        />
      )}
    </View>
  )
}
