import { Alert, Text, TouchableOpacity, View } from 'react-native'
import { translate } from '@/lib/translations/i18n'
import {
  ChevronDownIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ChevronUpIcon,
  EuroIcon,
  PlusIcon,
  Trash2Icon,
  TriangleAlertIcon,
} from 'lucide-react-native'
import { StatusBar } from 'expo-status-bar'
import { DarkColors, LightColors, useColors, useDefaultStyles } from '@/lib/constants/theme'
import { FormTextField } from '@/lib/components/TextField'
import { useSelectField } from '@/lib/components/SelectField'
import { GestureHandlerRootView } from 'react-native-gesture-handler'
import {
  KeyboardAwareScrollView,
  KeyboardController,
  KeyboardProvider,
  KeyboardToolbar,
} from 'react-native-keyboard-controller'
import { useAllUnits } from '@/modules/general/units.query'
import { z } from 'zod'
import { Button } from '@/lib/components/Button'
import { FormContextType } from '@formsignals/form-react'
import { ValidatorAdapter } from '@formsignals/form-core'
import { FormDatePicker } from '@/lib/components/DatePicker'
import { useComputed } from '@preact/signals-react'
import { formatDate } from 'date-fns'
import { Signal } from '@preact/signals-core'

// TODO Either add a confirm alert for the delete action or add a checkbox to enable the delete button

const ContractSchema = {
  contractName: z
    .string({ invalid_type_error: 'errors.required', required_error: 'errors.required' })
    .min(1, 'errors.min1'),
  contractIdentifier: z.string({ invalid_type_error: 'errors.required' }).nullable(),
  revisionPricePerUnit: z
    .number({ invalid_type_error: 'errors.required', required_error: 'errors.required' })
    .min(0, 'errors.positive'),
  revisionBasePayment: z
    .number({ invalid_type_error: 'errors.number', required_error: 'errors.required' })
    .min(0, 'errors.positive')
    .nullable(),
  revisionMonthlyPayment: z
    .number({ invalid_type_error: 'errors.number', required_error: 'errors.required' })
    .min(0, 'errors.positive')
    .nullable(),
  revisionStartDate: z.date({
    invalid_type_error: 'errors.required',
    required_error: 'errors.required',
  }),
  revisionEndDate: z
    .tuple([
      z
        .date({
          invalid_type_error: 'errors.date',
          required_error: 'errors.required',
        })
        .optional()
        .nullable(),
      z.date().nullable(),
    ])
    .refine(([endDate, startDate]) => {
      if (!endDate || startDate === null) return true
      return endDate >= startDate
    }, 'errors.endAfterStart'),
}
type FormValues = {
  contract: {
    name: string
    identifier: string
    buildingId: number
    unitId: number
  }
  contractRevision: {
    pricePerUnit: number
    basePayment: number | null
    monthlyPayment: number | null
    startDate: Date
    endDate: Date | null
  }
}

type ContractFormProps = {
  contractId?: number
  form: FormContextType<FormValues, ValidatorAdapter>
  onSubmit?: () => void
  maxDateRevisions?: Date
  revisionIds?: number[]
  selectedRevision?: number
  selectedRevisionId?: Signal<number | undefined>
  revisionSectionSaveAction?: false | (() => unknown)
  revisionSectionCancelAction?: false | (() => unknown)
}

export function ContractForm({
  contractId,
  form,
  onSubmit,
  maxDateRevisions,
  revisionIds,
  selectedRevision,
  selectedRevisionId,
  revisionSectionSaveAction,
  revisionSectionCancelAction,
}: ContractFormProps) {
  const colors = useColors()
  const defaultStyles = useDefaultStyles()

  const [units] = useAllUnits()
  const unitOptions = units.map((unit) => ({
    label: translate(unit.name),
    textRight: unit.abbreviation,
    value: unit.id,
  }))

  const unitSelect = useSelectField({
    label: translate('contracts.createLabelUnit'),
    options: unitOptions ?? [],
    modalTitle: translate('units.selectTitle'),
    value: form.data.peek().contract?.peek()?.unitId,
  })

  const indexOfSelectedRevision =
    selectedRevision === -1 ? (revisionIds?.length ?? 0) : (selectedRevision ?? 0)
  const isPrevEnabled = indexOfSelectedRevision > 0
  const isNextEnabled = indexOfSelectedRevision < (revisionIds?.length ?? 0) - 1

  const selectedRevisionText = useComputed(() => {
    const selectedStartDate = form.data.value.contractRevision.value.startDate.value
    if (!selectedStartDate) return translate('contracts.newRevisionHeader')
    return formatDate(selectedStartDate, 'LLLL y')
  })

  return (
    <KeyboardProvider>
      <GestureHandlerRootView>
        <KeyboardAwareScrollView
          bottomOffset={50}
          style={[defaultStyles.pageContainer]}
          contentContainerStyle={{ paddingBottom: 16 }}>
          <form.FieldProvider name='contract.name' validator={ContractSchema.contractName}>
            <FormTextField
              selectTextOnFocus
              label={translate('contracts.createLabelName')}
              placeholder={translate('general.typeHere')}
            />
          </form.FieldProvider>
          <form.FieldProvider name='contract.identifier'>
            <FormTextField
              selectTextOnFocus
              label={translate('contracts.createLabelIdentifier')}
              placeholder={translate('general.typeHere')}
            />
          </form.FieldProvider>

          <unitSelect.SelectField />

          <View style={{ marginBottom: 8, marginTop: 16 }}>
            <View style={defaultStyles.row}>
              <Text style={[defaultStyles.cardTitle, { flex: 1 }]}>
                {translate('contracts.createSectionRevision')}{' '}
                <Text style={defaultStyles.detail}>({selectedRevisionText.value})</Text>
              </Text>
              {revisionSectionSaveAction && revisionSectionCancelAction && (
                <View style={{ paddingVertical: 4, flexDirection: 'row' }}>
                  <Button variant='ghost' onPress={revisionSectionCancelAction}>
                    {translate('general.cancel')}
                  </Button>
                  <Button variant='text' onPress={revisionSectionSaveAction}>
                    {translate('general.save')}
                  </Button>
                </View>
              )}
              {!revisionSectionSaveAction && !revisionSectionCancelAction && selectedRevisionId && (
                <View style={defaultStyles.row}>
                  <Button
                    variant='icon'
                    disabled={!isPrevEnabled}
                    onPress={() => {
                      if (!isPrevEnabled) return
                      selectedRevisionId.value = revisionIds?.[indexOfSelectedRevision - 1]
                    }}>
                    <ChevronLeftIcon
                      size={16}
                      stroke={!isPrevEnabled ? colors.textMuted : colors.text}
                    />
                  </Button>
                  <Button
                    variant='icon'
                    disabled={selectedRevision === -1}
                    onPress={() => {
                      if (!isNextEnabled) {
                        selectedRevisionId.value = undefined
                        return
                      }
                      selectedRevisionId.value = revisionIds?.[indexOfSelectedRevision + 1]
                    }}>
                    {isNextEnabled ? (
                      <ChevronRightIcon size={16} stroke={colors.text} />
                    ) : (
                      <PlusIcon
                        size={16}
                        stroke={selectedRevision === -1 ? colors.textMuted : colors.primary}
                      />
                    )}
                  </Button>
                </View>
              )}
            </View>
            {!!selectedRevisionId?.value &&
              revisionSectionSaveAction &&
              revisionSectionCancelAction && (
                <View
                  style={[
                    defaultStyles.row,
                    {
                      marginTop: 4,
                      marginBottom: 4,
                      borderLeftWidth: 1,
                      borderColor: colors.warning,
                      paddingRight: 32,
                      paddingLeft: 8,
                      gap: 8,
                    },
                  ]}>
                  <TriangleAlertIcon size={16} stroke={colors.warning} />
                  <Text
                    style={[defaultStyles.detailSmall, { color: colors.warning, lineHeight: 14 }]}>
                    {translate('contracts.warningEditingExistingRevision')}
                  </Text>
                </View>
              )}
          </View>

          <form.FieldProvider
            name='contractRevision.pricePerUnit'
            transformFromBinding={(value: string) => {
              if (!value) return [null as never as number, false]
              const parsed = parseFloat(value.replace(',', '.'))
              return [parsed, isNaN(parsed) && translate('errors.number')]
            }}
            transformToBinding={(
              value: number | null,
              isValid: boolean,
              writeBuffer?: string
            ): string => {
              if (!isValid) {
                return writeBuffer ?? '' // This is the last value entered by the user
              }
              return value?.toString() ?? '' // This is the last valid value
            }}
            validator={ContractSchema.revisionPricePerUnit}>
            <FormTextField
              selectTextOnFocus
              useTransformed
              endIcon={
                <EuroIcon
                  color={colors.textStatic}
                  style={{ position: 'absolute', right: 8, top: 33, pointerEvents: 'none' }}
                  size={16}
                />
              }
              label={translate('contracts.createLabelPricePerUnit')}
              placeholder={translate('general.typeHere')}
              containerStyle={{ flex: 1 }}
              keyboardType='numeric'
            />
          </form.FieldProvider>

          <View style={[defaultStyles.row, { alignItems: 'flex-start' }]}>
            <form.FieldProvider
              name='contractRevision.monthlyPayment'
              transformFromBinding={(value: string) => {
                if (!value) return [null, false]
                const parsed = parseFloat(value.replace(',', '.'))
                return [parsed, isNaN(parsed) && translate('errors.number')]
              }}
              transformToBinding={(
                value: number | null,
                isValid: boolean,
                writeBuffer?: string
              ): string => {
                if (!isValid) {
                  return writeBuffer ?? '' // This is the last value entered by the user
                }
                return value?.toString() ?? '' // This is the last valid value
              }}
              validator={ContractSchema.revisionMonthlyPayment}>
              <FormTextField
                selectTextOnFocus
                useTransformed
                label={translate('contracts.createLabelMonthlyPayment')}
                hint={translate('contracts.createLabelMonthlyPaymentHint')}
                placeholder={translate('general.typeHere')}
                containerStyle={{ flex: 1 }}
                keyboardType='numeric'
              />
            </form.FieldProvider>

            <form.FieldProvider
              name='contractRevision.basePayment'
              transformFromBinding={(value: string) => {
                if (!value) return [null, false]
                const parsed = parseFloat(value.replace(',', '.'))
                return [parsed, isNaN(parsed) && translate('errors.number')]
              }}
              transformToBinding={(
                value: number | null,
                isValid: boolean,
                writeBuffer?: string
              ): string => {
                if (!isValid) {
                  return writeBuffer ?? '' // This is the last value entered by the user
                }
                return value?.toString() ?? '' // This is the last valid value
              }}
              validator={ContractSchema.revisionBasePayment}>
              <FormTextField
                selectTextOnFocus
                useTransformed
                label={translate('contracts.createLabelBasePayment')}
                hint={translate('contracts.createLabelBasePaymentHint')}
                placeholder={translate('general.typeHere')}
                containerStyle={{ flex: 1 }}
                keyboardType='numeric'
              />
            </form.FieldProvider>
          </View>

          <View style={[defaultStyles.row, { alignItems: 'flex-start' }]}>
            <form.FieldProvider
              name='contractRevision.startDate'
              validator={ContractSchema.revisionStartDate.refine(
                (startDate) =>
                  !!selectedRevisionId?.peek() ||
                  !maxDateRevisions ||
                  startDate >= maxDateRevisions,
                translate('contracts.startMustBeAfterPreviousRevisions')
              )}>
              <FormDatePicker label={translate('contracts.createLabelStartDate')} />
            </form.FieldProvider>

            <form.FieldProvider
              name='contractRevision.endDate'
              validateMixin={['contractRevision.startDate']}
              validator={ContractSchema.revisionEndDate as any}>
              <FormDatePicker label={translate('contracts.createLabelEndDate')} />
            </form.FieldProvider>
          </View>

          {contractId !== undefined && (
            <>
              <Text style={[defaultStyles.cardTitle, { marginBottom: 8, marginTop: 16 }]}>
                {translate('contracts.createSectionActions')}
              </Text>
              <View style={{ gap: 8 }}>
                <Button
                  size='large'
                  onPress={async () => {
                    Alert.alert(
                      translate('contracts.alertDeleteTitle'),
                      translate('contracts.alertDeleteDescription'),
                      [
                        {
                          text: translate('general.cancel'),
                          style: 'cancel',
                        },
                        {
                          text: translate('general.delete'),
                          style: 'destructive',
                          onPress: async () => {
                            // router.back()
                          },
                        },
                      ]
                    )
                  }}
                  IconStart={<Trash2Icon size={16} stroke={colors.negative} />}
                  variant='ghost'>
                  <View>
                    <Text style={[defaultStyles.bodyText, { color: colors.negative }]}>
                      {translate('contracts.actionDelete')}
                    </Text>
                    <Text style={[defaultStyles.detailSmall]}>
                      {translate('contracts.actionDeleteDescription')}
                    </Text>
                  </View>
                </Button>
              </View>
            </>
          )}
        </KeyboardAwareScrollView>

        <KeyboardToolbar
          theme={{
            dark: {
              primary: DarkColors.primary,
              background: DarkColors.card,
              ripple: 'transparent',
              disabled: DarkColors.primaryContainer,
            },
            light: {
              primary: LightColors.primary,
              background: LightColors.card,
              ripple: 'transparent',
              disabled: LightColors.primaryContainer,
            },
          }}
          doneText={translate('general.save')}
          onDoneCallback={() => (onSubmit ? onSubmit() : form.handleSubmit())}
          icon={({ type, disabled }) => (
            <TouchableOpacity
              disabled={disabled}
              style={{ padding: 8 }}
              onPress={() => KeyboardController.setFocusTo(type)}>
              {type === 'next' ? (
                <ChevronDownIcon
                  size={24}
                  stroke={disabled ? colors.primaryContainer : colors.primary}
                />
              ) : (
                <ChevronUpIcon
                  size={24}
                  stroke={disabled ? colors.primaryContainer : colors.primary}
                />
              )}
            </TouchableOpacity>
          )}
        />

        <unitSelect.SelectFieldSheet />

        <StatusBar />
      </GestureHandlerRootView>
    </KeyboardProvider>
  )
}
