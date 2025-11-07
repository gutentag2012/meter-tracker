import { Alert, Text, TouchableOpacity, View } from 'react-native'
import { useRouter } from 'expo-router'
import {
  CheckIcon,
  ChevronDownIcon,
  ChevronRightIcon,
  ChevronUpIcon,
  PencilIcon,
  PenIcon,
  PlusIcon,
  RefreshCcwIcon,
  SaveIcon,
  Trash2Icon,
  TrashIcon,
  XIcon,
} from 'lucide-react-native'
import { StatusBar } from '@/modules/general/components/interface/StatusBar'
import { GestureHandlerRootView } from 'react-native-gesture-handler'
import {
  deleteMeter,
  deleteMeterReset,
  getMeterResetsById,
  resetMeterValue,
  useAllMeterTypes,
  useMeterById,
  useMeterResetsById,
} from '@/modules/meters/meters.query'
import {
  KeyboardAwareScrollView,
  KeyboardController,
  KeyboardProvider,
  KeyboardToolbar,
} from 'react-native-keyboard-controller'
import { useAllContracts } from '@/modules/contracts/contracts.query'
import { z } from 'zod'
import { ZodAdapter } from '@formsignals/validation-adapter-zod'
import { Button } from '@/modules/general/components/inputs/Button'
import {
  FormContextType,
  useFieldContext,
  useForm,
} from '@formsignals/form-react'
import { currency } from '@/modules/settings/currency.signals'
import {
  KeyboardToolbarTheme,
  useColors,
  useDefaultStyles,
} from '@/modules/general/theme'
import { LangKey } from '@/modules/general/translations/en'
import {
  formatDate,
  formatNumber,
  translate,
} from '@/modules/general/translations'
import { useAllUnits } from '@/modules/units'
import {
  DatePicker,
  FormDatePicker,
  FormTextField,
  useSelectField,
} from '@/modules/general/components'
import { Fragment, useMemo } from 'react'
import { useSignal } from '@preact/signals-react'
import { Signal } from '@preact/signals-core'
import { useSignals } from '@preact/signals-react/runtime'
import Toast from 'react-native-toast-message'

const MeterSchema = {
  name: z
    .string({
      invalid_type_error: 'errors.required',
      required_error: 'errors.required',
    })
    .min(1, 'errors.min1'),
  precision: z
    .number({
      invalid_type_error: 'errors.number',
      required_error: 'errors.required',
    })
    .int('errors.integer')
    .min(0, 'errors.positive'),
  customUnitConversion: z
    .number({
      invalid_type_error: 'errors.number',
      required_error: 'errors.required',
    })
    .min(0, 'errors.positive')
    .nullable(),
}
type FormValues = {
  name: string
  identifier: string
  precision: number
  unit: number
  meterType: number
  contract: number | null
  customUnitConversion: number | null
  resets: {
    id: number
    timestamp: Date
    value: number
    meterId: number
  }[]
}

type MeterFormProps = {
  meterId?: number
  form: FormContextType<FormValues, typeof ZodAdapter>
}

export function MeterForm({ meterId, form }: MeterFormProps) {
  useSignals()
  const router = useRouter()
  const colors = useColors()
  const defaultStyles = useDefaultStyles()

  const [meterTypes] = useAllMeterTypes()
  const meterTypeOptions = meterTypes.map((meterType) => ({
    label: translate(`meterTypes.${meterType.category}.name` as LangKey),
    description: translate(
      `meterTypes.${meterType.category}.description` as LangKey,
    ),
    value: meterType.id,
  }))

  const [units] = useAllUnits()
  const unitOptions = units.map((unit) => ({
    label: translate(unit.name as LangKey),
    textRight: unit.abbreviation,
    value: unit.id,
  }))
  const selectedUnit = units.find(
    (unit) => unit.id === form.data.peek().unit?.value,
  )

  const [contracts] = useAllContracts()
  const contractOptions = contracts.map((contract) => ({
    label: contract.contract.name,
    textRight: formatNumber(contract.contractRevision?.pricePerUnit),
    description: contract.contract.identifier,
    value: contract.contract.id,
  }))
  const selectedContract = contracts.find(
    (contract) => contract.contract.id === form.data.peek().contract?.value,
  )

  const unitSelect = useSelectField({
    label: translate('meters.createLabelUnit'),
    options: unitOptions ?? [],
    modalTitle: translate('units.selectTitle'),
    value: form.data.peek().unit,
    containerStyle: {
      flex: 5,
    },
  })

  const typeSelect = useSelectField({
    label: translate('meters.createLabelMeterType'),
    options: meterTypeOptions ?? [],
    modalTitle: translate('meterTypes.selectTitle'),
    value: form.data.peek().meterType,
    hint: translate('meters.createLabelMeterTypeHint'),
  })

  const contractSelect = useSelectField({
    options: [
      { label: translate('contracts.selectValueEmpty'), value: null },
      ...contractOptions,
    ],
    value: form.data.peek().contract,
    modalTitle: translate('contracts.selectTitle'),
    ModalAction: (
      <Button
        style={{ marginLeft: 'auto' }}
        onPress={() => router.push('/contract/create')}
        IconStart={
          <PlusIcon
            size={defaultStyles.detail.fontSize}
            stroke={colors.primary}
          />
        }
      >
        {translate('contracts.createButton')}
      </Button>
    ),
  })

  const conversionFactor =
    form.data.peek().customUnitConversion.value ??
    selectedUnit?.conversionFactor ??
    1

  const showAdvancedContract = useSignal(false)

  return (
    <KeyboardProvider>
      <GestureHandlerRootView>
        <KeyboardAwareScrollView
          bottomOffset={50}
          style={[defaultStyles.pageContainer]}
          contentContainerStyle={{ paddingBottom: 16 }}
        >
          <form.FieldProvider name="name" validator={MeterSchema.name}>
            <FormTextField
              selectTextOnFocus
              label={translate('meters.createLabelName')}
              placeholder={translate('general.typeHere')}
            />
          </form.FieldProvider>
          <form.FieldProvider name="identifier">
            <FormTextField
              selectTextOnFocus
              label={translate('meters.createLabelIdentifier')}
              placeholder={translate('general.typeHere')}
            />
          </form.FieldProvider>

          <View style={[defaultStyles.row, { alignItems: 'flex-start' }]}>
            <form.FieldProvider
              name="precision"
              transformFromBinding={(value: string) => {
                if (!value) return [0, translate('errors.required')]
                const parsed = parseInt(value)
                return [parsed, isNaN(parsed) && translate('errors.number')]
              }}
              transformToBinding={(
                value: number,
                isValid: boolean,
                writeBuffer?: string,
              ): string => {
                if (!isValid) {
                  return writeBuffer ?? '' // This is the last value entered by the user
                }
                return value?.toString() // This is the last valid value
              }}
              validator={MeterSchema.precision}
            >
              <FormTextField
                selectTextOnFocus
                useTransformed
                label={translate('meters.createLabelPrecision')}
                placeholder={translate('general.typeHere')}
                keyboardType="numeric"
                containerStyle={{ flex: 3 }}
                hint={translate('meters.createLabelPrecisionHint')}
              />
            </form.FieldProvider>
            <unitSelect.SelectField />
          </View>

          <typeSelect.SelectField />

          <Text
            style={[
              defaultStyles.cardTitle,
              { marginBottom: 8, marginTop: 16 },
            ]}
          >
            {translate('meters.createSectionContracts')}
          </Text>

          <contractSelect.SelectField />

          {selectedContract && <Button
            IconStart={
              showAdvancedContract.value ? (
                <ChevronDownIcon size={16} stroke={colors.primary} />
              ) : (
                <ChevronRightIcon size={16} stroke={colors.primary} />
              )
            }
            style={{ marginBottom: 4 }}
            onPress={() => {
              showAdvancedContract.value = !showAdvancedContract.value
            }}
          >
            {translate('meters.advancedContractOptions')}
          </Button>}

          {showAdvancedContract.value && (
            <View>
              {selectedContract && (
                <form.FieldProvider
                  name="customUnitConversion"
                  transformFromBinding={(value: string) => {
                    if (!value) return [null, false]
                    const parsed = parseFloat(value.replace(',', '.'))
                    return [parsed, isNaN(parsed) && translate('errors.number')]
                  }}
                  transformToBinding={(
                    value: number | null,
                    isValid: boolean,
                    writeBuffer?: string,
                  ): string => {
                    if (!isValid) {
                      return writeBuffer ?? '' // This is the last value entered by the user
                    }
                    return value?.toString() ?? '' // This is the last valid value
                  }}
                  validator={MeterSchema.customUnitConversion}
                >
                  <FormTextField
                    selectTextOnFocus
                    useTransformed
                    label={translate('meters.createLabelCustomUnitConversion')}
                    hint={translate(
                      'meters.createLabelCustomUnitConversionHint',
                    )}
                    placeholder={translate('general.typeHere')}
                    containerStyle={{ flex: 1 }}
                    keyboardType="numeric"
                  />
                </form.FieldProvider>
              )}
              {selectedUnit && selectedContract && (
                <Fragment>
                  <Text style={[defaultStyles.detail]}>
                    {translate('meters.createSectionConversion')}
                  </Text>
                  <View
                    style={{
                      marginVertical: 4,
                      borderWidth: 1,
                      borderColor: colors.outline,
                      borderStyle: 'dashed',
                      borderRadius: 4,
                      paddingVertical: 8,
                      paddingHorizontal: 16,
                      flexDirection: 'row',
                      alignItems: 'center',
                    }}
                  >
                    <View style={{ minWidth: 0 }}>
                      <Text
                        style={[defaultStyles.detail, { textAlign: 'center' }]}
                      >
                        1 {selectedUnit.abbreviation}
                      </Text>
                    </View>
                    <View style={{ minWidth: 24, alignItems: 'center' }}>
                      <XIcon size={16} stroke={colors.textMuted} />
                    </View>
                    <View style={{ minWidth: 0 }}>
                      <Text
                        style={[defaultStyles.detail, { textAlign: 'center' }]}
                      >
                        {conversionFactor} {selectedContract.unit?.abbreviation}
                      </Text>
                      <View
                        style={{
                          borderStyle: 'solid',
                          borderWidth: 1,
                          borderBottomColor: colors.text,
                        }}
                      />
                      <Text
                        style={[defaultStyles.detail, { textAlign: 'center' }]}
                      >
                        {selectedContract.unit?.conversionFactor}{' '}
                        {selectedUnit.abbreviation}
                      </Text>
                    </View>
                    <View style={{ minWidth: 24, alignItems: 'center' }}>
                      <XIcon size={16} stroke={colors.textMuted} />
                    </View>
                    <View style={{ minWidth: 0 }}>
                      <Text
                        style={[defaultStyles.detail, { textAlign: 'center' }]}
                      >
                        {formatNumber(
                          selectedContract.contractRevision?.pricePerUnit,
                        )}{' '}
                        {currency.value.currencySymbol}/
                        {(selectedContract.unit?.abbreviation ?? '-') + ' '}
                      </Text>
                    </View>
                    <View style={{ minWidth: 16 }}>
                      <Text
                        style={[defaultStyles.detail, { textAlign: 'center' }]}
                      >
                        =
                      </Text>
                    </View>
                    <View style={{ minWidth: 0 }}>
                      <Text
                        style={[defaultStyles.detail, { textAlign: 'center' }]}
                      >
                        {formatNumber(
                          (conversionFactor /
                            (selectedContract.unit?.conversionFactor ?? 1)) *
                            (selectedContract.contractRevision?.pricePerUnit ??
                              1),
                        )}{' '}
                        {currency.value.currencySymbol}
                      </Text>
                    </View>
                  </View>
                  <Text style={[defaultStyles.detailSmall]}>
                    {translate('meters.createSectionConversionHint')}
                  </Text>
                </Fragment>
              )}
            </View>
          )}

          {meterId !== undefined && (
            <Fragment>
              <View
                style={[
                  defaultStyles.row,
                  {
                    justifyContent: 'space-between',
                    marginTop: 16,
                    marginBottom: 4,
                  },
                ]}
              >
                <Text style={defaultStyles.cardTitle}>
                  {translate('meters.createSectionResets')}
                </Text>
                <Button
                  IconStart={
                    <RefreshCcwIcon size={12} stroke={colors.primary} />
                  }
                  onPress={async () => {
                    Toast.show({
                      type: 'progress',
                      text1: translate('meters.toast.resetting'),
                      autoHide: false,
                    })
                    await resetMeterValue(meterId)
                    Toast.show({
                      type: 'success',
                      text1: translate('meters.toast.didReset'),
                    })
                  }}
                >
                  {translate('meters.actionReset')}
                </Button>
              </View>
              <Text style={[defaultStyles.detail, { marginBottom: 8 }]}>
                {translate('meters.createSectionDescriptionResets')}
              </Text>

              {form.data.peek().resets.value.map((reset, index) => (
                <form.FieldProvider key={reset.key} name={`resets.${index}`}>
                  <ResetRow unit={selectedUnit?.abbreviation} />
                </form.FieldProvider>
              ))}

              <Text
                style={[
                  defaultStyles.cardTitle,
                  { marginBottom: 8, marginTop: 16 },
                ]}
              >
                {translate('meters.createSectionActions')}
              </Text>
              <View style={{ gap: 8 }}>
                {/* TODO Add Back once there is a way to activate them again */}
                {/*<Button*/}
                {/*  size='large'*/}
                {/*  IconStart={<EyeClosedIcon size={16} stroke={colors.textMuted} />}*/}
                {/*  variant='outlined'>*/}
                {/*  <View>*/}
                {/*    <Text style={[defaultStyles.bodyText]}>*/}
                {/*      {translate('meters.actionInactive')}*/}
                {/*    </Text>*/}
                {/*    <Text style={[defaultStyles.detailSmall]}>*/}
                {/*      {translate('meters.actionInactiveDescription')}*/}
                {/*    </Text>*/}
                {/*  </View>*/}
                {/*</Button>*/}
                <Button
                  size="large"
                  onPress={() => {
                    Alert.alert(
                      translate('meters.alertDeleteTitle'),
                      translate('meters.alertDeleteDescription'),
                      [
                        {
                          text: translate('general.cancel'),
                          style: 'cancel',
                        },
                        {
                          text: translate('general.delete'),
                          style: 'destructive',
                          onPress: async () => {
                            Toast.show({
                              type: "progress",
                              text1: translate("meters.toast.deleting"),
                              autoHide: false
                            })
                            await deleteMeter(meterId)
                            Toast.show({
                              type: "success",
                              text1: translate("meters.toast.didDelete"),
                            })
                            router.navigate('/')
                          },
                        },
                      ],
                    )
                  }}
                  IconStart={<Trash2Icon size={16} stroke={colors.negative} />}
                  variant="ghost"
                >
                  <View>
                    <Text
                      style={[
                        defaultStyles.bodyText,
                        { color: colors.negative },
                      ]}
                    >
                      {translate('meters.actionDelete')}
                    </Text>
                    <Text style={[defaultStyles.detailSmall, {paddingRight: 16}]}>
                      {translate('meters.actionDeleteDescription')}
                    </Text>
                  </View>
                </Button>
              </View>
            </Fragment>
          )}
        </KeyboardAwareScrollView>
        <KeyboardToolbar
          theme={KeyboardToolbarTheme}
          doneText={translate('general.save')}
          onDoneCallback={() => form.handleSubmit()}
          icon={({ type, disabled }) => (
            <TouchableOpacity
              disabled={disabled}
              style={{ padding: 8 }}
              onPress={() => KeyboardController.setFocusTo(type)}
            >
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
        <typeSelect.SelectFieldSheet />
        <contractSelect.SelectFieldSheet />

        <StatusBar />
      </GestureHandlerRootView>
    </KeyboardProvider>
  )
}

type ResetRowProps = {
  unit?: string
}

function ResetRow({ unit }: ResetRowProps) {
  useSignals()
  const field = useFieldContext<
    { id: number; timestamp: Date; value: number },
    ''
  >()

  const colors = useColors()
  const defaultStyles = useDefaultStyles()

  const isEdit = useSignal(false)

  if (!isEdit.value) {
    return (
      <View
        style={[
          defaultStyles.row,
          {
            padding: 8,
            backgroundColor: colors.card,
            borderRadius: 4,
            marginBottom: 8,
          },
        ]}
      >
        <Text style={defaultStyles.detail}>
          {formatDate(field.data.peek().timestamp.value)}
        </Text>
        <Text style={[defaultStyles.detail, { marginLeft: 'auto' }]}>
          {field.data.peek().value.value}{' '}
          <Text style={defaultStyles.detailSmall}>{unit}</Text>
        </Text>
        <View style={[defaultStyles.row, { gap: 4 }]}>
          <Button onPress={() => (isEdit.value = true)}>
            {translate('general.edit') + " "}
          </Button>
          <Button
            onPress={async () => {
              Toast.show({
                type: 'progress',
                text1: translate('meters.toast.removingReset'),
                autoHide: false,
              })
              await deleteMeterReset(field.data.peek().id.peek())
              Toast.show({
                type: 'success',
                text1: translate('meters.toast.didRemoveReset'),
              })
            }}
            IconStart={<TrashIcon size={12} stroke={colors.negative} />}
          />
        </View>
      </View>
    )
  }

  return (
    <View style={defaultStyles.row}>
      <field.SubFieldProvider name="timestamp">
        <FormDatePicker
          containerStyle={{ flex: 3 }}
          style={{ paddingVertical: 8 }}
        />
      </field.SubFieldProvider>
      <field.SubFieldProvider
        name="value"
        transformFromBinding={(value: string) => {
          if (!value) return [0, translate('errors.required')]
          const parsed = parseFloat(value.replace(',', '.'))
          return [parsed, isNaN(parsed) && translate('errors.number')]
        }}
        transformToBinding={(
          value: number,
          isValid: boolean,
          writeBuffer?: string,
        ): string => {
          if (!isValid) {
            return writeBuffer ?? '' // This is the last value entered by the user
          }
          return value?.toString() // This is the last valid value
        }}
      >
        <FormTextField
          useTransformed
          keyboardType="numeric"
          containerStyle={{ flex: 2 }}
          style={{ paddingVertical: 8 }}
          placeholder="Enter Value"
        />
      </field.SubFieldProvider>
      <Button
        style={{ marginBottom: 8 }}
        onPress={() => (isEdit.value = false)}
      >
        {translate('general.ok')}
      </Button>
    </View>
  )
}
