import { Alert, Text, TouchableOpacity, View } from 'react-native'
import { Link, useRouter } from 'expo-router'
import {
  ChevronDownIcon,
  ChevronUpIcon,
  FlashlightIcon,
  FlashlightOffIcon,
  PlusIcon,
  Trash2Icon,
} from 'lucide-react-native'
import { FormTextField } from '@/modules/general/components/inputs/TextField'
import { GestureHandlerRootView } from 'react-native-gesture-handler'
import { useMetersForBuilding } from '@/modules/meters/meters.query'
import {
  KeyboardAwareScrollView,
  KeyboardController,
  KeyboardProvider,
  KeyboardStickyView,
  KeyboardToolbar,
} from 'react-native-keyboard-controller'
import { z } from 'zod'
import { ZodAdapter } from '@formsignals/validation-adapter-zod'
import { Button } from '@/modules/general/components/inputs/Button'
import type { FormContextType } from '@formsignals/form-react'
import {
  deleteReading,
  useLastReadingForDateAndMeter,
} from '@/modules/readings/readings.query'
import { useSelectField } from '@/modules/general/components/inputs/SelectField'
import { Fragment, useState } from 'react'
import { CameraView } from 'expo-camera'
import { FormDatePicker } from '@/modules/general/components/inputs/DatePicker'
import { useField } from '@formsignals/form-react'
import {
  formatDate,
  formatNumber,
  translate,
} from '@/modules/general/translations'
import {
  KeyboardToolbarTheme,
  useColors,
  useDefaultStyles,
} from '@/modules/general/theme'

const ReadingSchema = {
  value: z
    .number({
      invalid_type_error: 'errors.number',
      required_error: 'errors.required',
    })
    .min(0, 'errors.positive'),
  timestamp: z.date({
    invalid_type_error: 'errors.invalidDate',
    required_error: 'errors.required',
  }),
  meter: z.number({
    invalid_type_error: 'errors.number',
    required_error: 'errors.required',
  }),
}
type FormValues = {
  value: number
  timestamp: Date
  meter: number
}

type ReadingFormProps = {
  form: FormContextType<FormValues, typeof ZodAdapter>
  readingId?: number
}

export function ReadingForm({ form, readingId }: ReadingFormProps) {
  const router = useRouter()
  const colors = useColors()
  const defaultStyles = useDefaultStyles()

  const [isTorchEnabled, setIsTorchEnabled] = useState(false)

  const [lastReading] = useLastReadingForDateAndMeter(
    form.data.peek().meter,
    form.data.peek().timestamp,
  )

  const [meters] = useMetersForBuilding()
  const meterOptions = meters.map((meter) => ({
    label: meter.meterName!,
    description: meter.identifier,
    textRight: meter.lastReading
      ? formatNumber(meter.lastReading, meter.meterPrecision) +
        ' ' +
        meter.meterUnit
      : '-',
    value: meter.meterId,
  }))

  const meterField = useField(form, 'meter', {
    validator: ReadingSchema.meter,
  })

  const meterSelect = useSelectField({
    options: meterOptions,
    label: translate('readings.createLabelMeter'),
    modalTitle: translate('meters.selectTitle'),
    ModalAction: (
      <Link href="/meter/create" asChild>
        <Button
          style={{ marginLeft: 'auto' }}
          IconStart={
            <PlusIcon
              size={defaultStyles.detail.fontSize}
              stroke={colors.primary}
            />
          }
        >
          {translate('meters.createButton')}
        </Button>
      </Link>
    ),
    value: meterField.data,
  })

  return (
    <KeyboardProvider>
      <GestureHandlerRootView>
        <CameraView enableTorch={isTorchEnabled} />

        <KeyboardAwareScrollView
          bottomOffset={50}
          style={[defaultStyles.pageContainer]}
          contentContainerStyle={{ paddingBottom: 16 }}
        >
          <form.FieldProvider
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
            validator={ReadingSchema.value}
          >
            <FormTextField
              autoFocus
              selectTextOnFocus
              useTransformed
              enterKeyHint="done"
              onSubmitEditing={() => form.handleSubmit()}
              hint={
                lastReading
                  ? translate('readings.lastReadingHint', {
                      value: lastReading.value,
                      timestamp: formatDate(lastReading.timestamp),
                    })
                  : translate('readings.noLastReadingHint')
              }
              label={translate('readings.createLabelValue')}
              placeholder={translate('general.typeHere')}
              containerStyle={{ flex: 1 }}
              keyboardType="numeric"
            />
          </form.FieldProvider>

          <form.FieldProvider
            name="timestamp"
            validator={ReadingSchema.timestamp}
          >
            <FormDatePicker
              label={translate('readings.createLabelTimestamp')}
              withTime
            />
          </form.FieldProvider>

          <meterSelect.SelectField />

          {readingId !== undefined && (
            <Fragment>
              <Text
                style={[
                  defaultStyles.cardTitle,
                  { marginBottom: 8, marginTop: 16 },
                ]}
              >
                {translate('readings.createSectionActions')}
              </Text>
              <View style={{ gap: 8 }}>
                <Button
                  size="large"
                  onPress={async () => {
                    Alert.alert(
                      translate('readings.alertDeleteTitle'),
                      translate('readings.alertDeleteDescription'),
                      [
                        {
                          text: translate('general.cancel'),
                          style: 'cancel',
                        },
                        {
                          text: translate('general.delete'),
                          style: 'destructive',
                          onPress: async () => {
                            await deleteReading(readingId)
                            router.back()
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
                      {translate('readings.actionDelete')}
                    </Text>
                    <Text style={[defaultStyles.detailSmall]}>
                      {translate('readings.actionDeleteDescription')}
                    </Text>
                  </View>
                </Button>
              </View>
            </Fragment>
          )}
        </KeyboardAwareScrollView>

        <KeyboardStickyView
          style={{ backgroundColor: colors.background }}
          offset={{ closed: 0, opened: -40 }}
        >
          <TouchableOpacity
            onPress={() => setIsTorchEnabled((prev) => !prev)}
            style={[
              defaultStyles.fab,
              {
                marginLeft: 'auto',
                width: 48,
                height: 48,
                margin: 16,
              },
            ]}
          >
            {isTorchEnabled ? (
              <FlashlightOffIcon size={24} stroke={colors.onPrimaryContainer} />
            ) : (
              <FlashlightIcon size={24} stroke={colors.onPrimaryContainer} />
            )}
          </TouchableOpacity>
        </KeyboardStickyView>

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

        <meterSelect.SelectFieldSheet />
      </GestureHandlerRootView>
    </KeyboardProvider>
  )
}
