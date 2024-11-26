import { Alert, Text, TouchableOpacity, View } from 'react-native'
import { formatNumber, translate } from '@/lib/translations/i18n'
import { useRouter } from 'expo-router'
import {
  ChevronDownIcon,
  ChevronUpIcon,
  PlusIcon,
  RefreshCcwIcon,
  Trash2Icon,
  XIcon,
} from 'lucide-react-native'
import { StatusBar } from '@/lib/components/StatusBar'
import { DarkColors, LightColors, useColors, useDefaultStyles } from '@/lib/constants/theme'
import { FormTextField } from '@/lib/components/TextField'
import { useSelectField } from '@/lib/components/SelectField'
import { GestureHandlerRootView } from 'react-native-gesture-handler'
import { deleteMeter, resetMeterValue, useAllMeterTypes } from '@/modules/meters/meters.query'
import {
  KeyboardAwareScrollView,
  KeyboardController,
  KeyboardProvider,
  KeyboardToolbar,
} from 'react-native-keyboard-controller'
import { LangKey } from '@/lib/translations/en'
import { useAllUnits } from '@/modules/general/units.query'
import { useAllContracts } from '@/modules/contracts/contracts.query'
import { z } from 'zod'
import { ZodAdapter } from '@formsignals/validation-adapter-zod'
import { Button } from '@/lib/components/Button'
import type { FormContextType } from '@formsignals/form-react'
import { currency } from '@/modules/general/settings/currency.signals'

// TODO Either add a confirm alert for the delete action or add a checkbox to enable the delete button

const MeterSchema = {
  name: z
    .string({ invalid_type_error: 'errors.required', required_error: 'errors.required' })
    .min(1, 'errors.min1'),
  precision: z
    .number({ invalid_type_error: 'errors.number', required_error: 'errors.required' })
    .int('errors.integer')
    .min(0, 'errors.positive'),
  customUnitConversion: z
    .number({ invalid_type_error: 'errors.number', required_error: 'errors.required' })
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
}

type MeterFormProps = {
  meterId?: number
  form: FormContextType<FormValues, typeof ZodAdapter>
}

export function MeterForm({ meterId, form }: MeterFormProps) {
  const router = useRouter()
  const colors = useColors()
  const defaultStyles = useDefaultStyles()

  const [meterTypes] = useAllMeterTypes()
  const meterTypeOptions = meterTypes.map((meterType) => ({
    label: translate(`meterTypes.${meterType.category}.name` as LangKey),
    description: translate(`meterTypes.${meterType.category}.description` as LangKey),
    value: meterType.id,
  }))

  const [units] = useAllUnits()
  const unitOptions = units.map((unit) => ({
    label: translate(unit.name),
    textRight: unit.abbreviation,
    value: unit.id,
  }))
  const selectedUnit = units.find((unit) => unit.id === form.data.peek().unit?.value)

  const [contracts] = useAllContracts()
  const contractOptions = contracts.map((contract) => ({
    label: contract.contract.name,
    textRight: formatNumber(contract.contractRevision?.pricePerUnit),
    description: contract.contract.identifier,
    value: contract.contract.id,
  }))
  const selectedContract = contracts.find(
    (contract) => contract.contract.id === form.data.peek().contract?.value
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
    label: translate('meters.createLabelContract'),
    options: [{ label: translate('contracts.selectValueEmpty'), value: null }, ...contractOptions],
    value: form.data.peek().contract,
    modalTitle: translate('contracts.selectTitle'),
    ModalAction: (
      <Button
        style={{ marginLeft: 'auto' }}
        IconStart={<PlusIcon size={defaultStyles.detail.fontSize} stroke={colors.primary} />}>
        {translate('contracts.createButton')}
      </Button>
    ),
  })

  const conversionFactor =
    form.data.peek().customUnitConversion.value ?? selectedUnit?.conversionFactor ?? 1

  return (
    <KeyboardProvider>
      <GestureHandlerRootView>
        <KeyboardAwareScrollView
          bottomOffset={50}
          style={[defaultStyles.pageContainer]}
          contentContainerStyle={{ paddingBottom: 16 }}>
          <form.FieldProvider name='name' validator={MeterSchema.name}>
            <FormTextField
              selectTextOnFocus
              label={translate('meters.createLabelName')}
              placeholder={translate('general.typeHere')}
            />
          </form.FieldProvider>
          <form.FieldProvider name='identifier'>
            <FormTextField
              selectTextOnFocus
              label={translate('meters.createLabelIdentifier')}
              placeholder={translate('general.typeHere')}
            />
          </form.FieldProvider>

          <View style={[defaultStyles.row, { alignItems: 'flex-start' }]}>
            <form.FieldProvider
              name='precision'
              transformFromBinding={(value: string) => {
                if (!value) return [0, translate('errors.required')]
                const parsed = parseInt(value)
                return [parsed, isNaN(parsed) && translate('errors.number')]
              }}
              transformToBinding={(
                value: number,
                isValid: boolean,
                writeBuffer?: string
              ): string => {
                if (!isValid) {
                  return writeBuffer ?? '' // This is the last value entered by the user
                }
                return value?.toString() // This is the last valid value
              }}
              validator={MeterSchema.precision}>
              <FormTextField
                selectTextOnFocus
                useTransformed
                label={translate('meters.createLabelPrecision')}
                placeholder={translate('general.typeHere')}
                keyboardType='numeric'
                containerStyle={{ flex: 3 }}
                hint={translate('meters.createLabelPrecisionHint')}
              />
            </form.FieldProvider>
            <unitSelect.SelectField />
          </View>

          <typeSelect.SelectField />

          <Text style={[defaultStyles.cardTitle, { marginBottom: 8, marginTop: 16 }]}>
            {translate('meters.createSectionContracts')}
          </Text>

          <contractSelect.SelectField />
          {selectedContract && (
            <form.FieldProvider
              name='customUnitConversion'
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
              validator={MeterSchema.customUnitConversion}>
              <FormTextField
                selectTextOnFocus
                useTransformed
                label={translate('meters.createLabelCustomUnitConversion')}
                hint={translate('meters.createLabelCustomUnitConversionHint')}
                placeholder={translate('general.typeHere')}
                containerStyle={{ flex: 1 }}
                keyboardType='numeric'
              />
            </form.FieldProvider>
          )}
          {selectedUnit && selectedContract && (
            <>
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
                }}>
                <View style={{ minWidth: 0 }}>
                  <Text style={[defaultStyles.detail, { textAlign: 'center' }]}>
                    1 {selectedUnit.abbreviation}
                  </Text>
                </View>
                <View style={{ minWidth: 24, alignItems: 'center' }}>
                  <XIcon size={16} stroke={colors.textMuted} />
                </View>
                <View style={{ minWidth: 0 }}>
                  <Text style={[defaultStyles.detail, { textAlign: 'center' }]}>
                    {conversionFactor} {selectedContract.unit?.abbreviation}
                  </Text>
                  <View
                    style={{ borderStyle: 'solid', borderWidth: 1, borderBottomColor: colors.text }}
                  />
                  <Text style={[defaultStyles.detail, { textAlign: 'center' }]}>
                    {selectedContract.unit?.conversionFactor} {selectedUnit.abbreviation}
                  </Text>
                </View>
                <View style={{ minWidth: 24, alignItems: 'center' }}>
                  <XIcon size={16} stroke={colors.textMuted} />
                </View>
                <View style={{ minWidth: 0 }}>
                  <Text style={[defaultStyles.detail, { textAlign: 'center' }]}>
                    {formatNumber(selectedContract.contractRevision?.pricePerUnit)}{' '}
                    {currency.value.currencySymbol}/{selectedContract.unit?.abbreviation}
                  </Text>
                </View>
                <View style={{ minWidth: 16 }}>
                  <Text style={[defaultStyles.detail, { textAlign: 'center' }]}>=</Text>
                </View>
                <View style={{ minWidth: 0 }}>
                  <Text style={[defaultStyles.detail, { textAlign: 'center' }]}>
                    {formatNumber(
                      (conversionFactor / (selectedContract.unit?.conversionFactor ?? 1)) *
                        (selectedContract.contractRevision?.pricePerUnit ?? 1)
                    )}{' '}
                    {currency.value.currencySymbol}
                  </Text>
                </View>
              </View>
              <Text style={[defaultStyles.detailSmall]}>
                {translate('meters.createSectionConversionHint')}
              </Text>
            </>
          )}

          {meterId !== undefined && (
            <>
              <Text style={[defaultStyles.cardTitle, { marginBottom: 8, marginTop: 16 }]}>
                {translate('meters.createSectionActions')}
              </Text>
              <View style={{ gap: 8 }}>
                <Button
                  size='large'
                  onPress={async () => {
                    await resetMeterValue(meterId)
                    router.back()
                  }}
                  IconStart={<RefreshCcwIcon size={16} stroke={colors.textMuted} />}
                  variant='ghost'>
                  <View>
                    <Text style={[defaultStyles.detail, { color: colors.text }]}>
                      {translate('meters.actionReset')}
                    </Text>
                    <Text style={[defaultStyles.detailSmall]}>
                      {translate('meters.actionResetDescription')}
                    </Text>
                  </View>
                </Button>
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
                  size='large'
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
                            await deleteMeter(meterId)
                            router.navigate('/')
                          },
                        },
                      ]
                    )
                  }}
                  IconStart={<Trash2Icon size={16} stroke={colors.negative} />}
                  variant='ghost'>
                  <View>
                    <Text style={[defaultStyles.bodyText, { color: colors.negative }]}>
                      {translate('meters.actionDelete')}
                    </Text>
                    <Text style={[defaultStyles.detailSmall]}>
                      {translate('meters.actionDeleteDescription')}
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
          onDoneCallback={() => form.handleSubmit()}
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
        <typeSelect.SelectFieldSheet />
        <contractSelect.SelectFieldSheet />

        <StatusBar />
      </GestureHandlerRootView>
    </KeyboardProvider>
  )
}
