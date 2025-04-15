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
  TriangleAlertIcon,
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
import { deleteBuilding, useBuildingCount } from '@/modules/buildings'

const BuildingSchema = {
  name: z
    .string({
      invalid_type_error: 'errors.required',
      required_error: 'errors.required',
    })
    .min(1, 'errors.min1'),
  address: z
    .string({
      invalid_type_error: 'errors.required',
      required_error: 'errors.required',
    })
    .optional(),
  notes: z
    .string({
      invalid_type_error: 'errors.required',
      required_error: 'errors.required',
    })
    .optional(),
}
type FormValues = {
  name: string
  address: string | undefined
  notes: string | undefined
}

type BuildingFormProps = {
  buildingId?: number
  form: FormContextType<FormValues, typeof ZodAdapter>
}

export function BuildingForm({ buildingId, form }: BuildingFormProps) {
  useSignals()
  const router = useRouter()
  const colors = useColors()
  const defaultStyles = useDefaultStyles()

  const [buildingCount] = useBuildingCount()

  return (
    <KeyboardProvider>
      <GestureHandlerRootView>
        <KeyboardAwareScrollView
          bottomOffset={50}
          style={[defaultStyles.pageContainer]}
          contentContainerStyle={{ paddingBottom: 16 }}
        >
          <form.FieldProvider name="name" validator={BuildingSchema.name}>
            <FormTextField
              selectTextOnFocus
              label={translate('buildings.createLabelName')}
              placeholder={translate('general.typeHere')}
            />
          </form.FieldProvider>
          <form.FieldProvider name="address" validator={BuildingSchema.address}>
            <FormTextField
              selectTextOnFocus
              label={translate('buildings.createLabelAddress')}
              placeholder={translate('general.typeHere')}
            />
          </form.FieldProvider>
          <form.FieldProvider name="notes" validator={BuildingSchema.notes}>
            <FormTextField
              multiline
              numberOfLines={4}
              textAlignVertical="top"
              style={{ height: 100 }}
              label={translate('buildings.createLabelNotes')}
              placeholder={translate('general.typeHere')}
            />
          </form.FieldProvider>
          {buildingId !== undefined && (
            <Fragment>
              <Text
                style={[
                  defaultStyles.cardTitle,
                  { marginBottom: 8, marginTop: 16 },
                ]}
              >
                {translate('buildings.createSectionActions')}
              </Text>
              <View style={{ gap: 8 }}>
                {(buildingCount ?? 0) <= 1 && (
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
                    ]}
                  >
                    <TriangleAlertIcon size={16} stroke={colors.warning} />
                    <Text
                      style={[
                        defaultStyles.detailSmall,
                        { color: colors.warning, lineHeight: 14 },
                      ]}
                    >
                      {translate('buildings.lastBuildingWarning')}
                    </Text>
                  </View>
                )}
                <Button
                  disabled={(buildingCount ?? 0) <= 1}
                  style={{ opacity: (buildingCount ?? 0) <= 1 ? 0.5 : 1 }}
                  size="large"
                  onPress={() => {
                    Alert.alert(
                      translate('buildings.alertDeleteTitle'),
                      translate('buildings.alertDeleteDescription'),
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
                              type: 'progress',
                              text1: translate('buildings.toast.deleting'),
                              autoHide: false,
                            })
                            await deleteBuilding(buildingId)
                            Toast.show({
                              type: 'success',
                              text1: translate('buildings.toast.didDelete'),
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
                      {translate('buildings.actionDelete')}
                    </Text>
                    <Text
                      style={[defaultStyles.detailSmall, { paddingRight: 16 }]}
                    >
                      {translate('buildings.actionDeleteDescription')}
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

        <StatusBar />
      </GestureHandlerRootView>
    </KeyboardProvider>
  )
}
