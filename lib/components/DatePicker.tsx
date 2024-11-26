import { useColors, useDefaultStyles } from '@/lib/constants/theme'
import { useEffect, useMemo, useState } from 'react'
import {
  StyleSheet,
  Text,
  TextInput,
  TextInputProps,
  TouchableOpacity,
  View,
  ViewProps,
} from 'react-native'
import { Signal } from '@preact/signals-core'
import { useFieldContext } from '@formsignals/form-react'
import { formatDate, translate } from '@/lib/translations/i18n'
import { LangKey } from '@/lib/translations/en'
import { AndroidNativeProps, DateTimePickerAndroid } from '@react-native-community/datetimepicker'
import { CalendarIcon } from 'lucide-react-native'
import { runOnJS } from 'react-native-reanimated'

type DatePickerProps = Omit<AndroidNativeProps, 'value' | 'onChange'> & {
  label?: string
  value: Signal<Date | undefined | null>
  containerStyle?: ViewProps['style']
  isError?: boolean
  hint?: string
  withTime?: boolean
  disabled?: boolean
}

// TODO Make support iOS once necessary
export function DatePicker({
  style,
  label,
  value,
  containerStyle,
  hint,
  withTime,
  isError,
  disabled,
  ...props
}: DatePickerProps) {
  const colors = useColors()
  const defaultStyles = useDefaultStyles()

  const styles = useMemo(
    () =>
      StyleSheet.create({
        container: {
          flex: 1,
          gap: 4,
          marginBottom: 8,
          opacity: disabled ? 0.5 : 1,
        },
        inputBase: {
          ...defaultStyles.bodyText,
          backgroundColor: colors.card,
          paddingHorizontal: 12,
          paddingVertical: 12,
          borderRadius: 4,
          borderWidth: 1,
          borderColor: colors.outline,
          flexDirection: 'row',
          gap: 12,
        },
        label: {
          ...defaultStyles.detail,
        },
        disabled: {
          color: disabled ? colors.textMuted : colors.textStatic,
        },
      }),
    [disabled, colors, defaultStyles]
  )

  const hintTranslation = translate(hint as LangKey)
  const realHint = hintTranslation.startsWith('[missing') ? hint : hintTranslation
  const format = withTime ? 'PPP p' : 'PPP'

  return (
    <View style={[styles.container, containerStyle].flat()}>
      {label && <Text style={styles.label}>{label}</Text>}
      <TouchableOpacity
        onPress={() =>
          DateTimePickerAndroid.open({
            mode: 'date',
            is24Hour: true,
            neutralButton: {
              label: translate('general.clear'),
              textColor: colors.negative,
            },
            positiveButton: {
              label: translate('general.select'),
              textColor: colors.textMuted,
            },
            negativeButton: {
              label: translate('general.cancel'),
              textColor: colors.textMuted,
            },
            value: value.value ?? new Date(),
            onChange: (e, selectedDate) => {
              value.value = e.type === 'neutralButtonPressed' ? null : selectedDate
              if (!selectedDate || e.type === 'dismissed' || !withTime) {
                return
              }
              DateTimePickerAndroid.open({
                mode: 'time',
                is24Hour: true,
                value: selectedDate ?? new Date(),
                onChange: (_, selectedDate) => {
                  value.value = selectedDate
                },
                ...props,
              })
            },
            ...props,
          })
        }
        style={[styles.inputBase, isError && { borderColor: colors.negative }, style].flat()}>
        <CalendarIcon size={16} color={colors.textStatic} />
        <Text style={[defaultStyles.bodyText, disabled && styles.disabled]}>
          {value.value ? formatDate(value.value, format) : '-'}
        </Text>
      </TouchableOpacity>
      {hint && (
        <Text style={[defaultStyles.detailSmall, isError && { color: colors.negative }]}>
          {realHint}
        </Text>
      )}
    </View>
  )
}

export function FormDatePicker({
  useTransformed,
  style,
  hint,
  ...props
}: Omit<DatePickerProps, 'value'> & { useTransformed?: boolean }) {
  const field = useFieldContext<Date, '', Date>()
  return (
    <DatePicker
      {...props}
      value={useTransformed ? field.transformedData : field.data}
      isError={!field.isValid.value}
      hint={field.errors.value.join(', ') || hint}
    />
  )
}
