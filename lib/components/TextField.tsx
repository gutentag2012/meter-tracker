import { useColors, useDefaultStyles } from '@/lib/constants/theme'
import { ReactNode, useEffect, useMemo, useState } from 'react'
import { StyleSheet, Text, TextInput, TextInputProps, View, ViewProps } from 'react-native'
import { Signal } from '@preact/signals-core'
import { useFieldContext } from '@formsignals/form-react'
import { translate } from '@/lib/translations/i18n'
import { LangKey } from '@/lib/translations/en'
import { EuroIcon } from 'lucide-react-native'
import { useComputed, useSignal } from '@preact/signals-react'

type TextFieldProps = Omit<TextInputProps, 'defaultValue'> & {
  label?: string
  containerStyle?: ViewProps['style']
  defaultValue?: string
  isError?: boolean
  hint?: string
  endIcon?: ReactNode
}

export function TextField({
  style,
  defaultValue,
  label,
  containerStyle,
  hint,
  isError,
  endIcon,
  ...props
}: TextFieldProps) {
  const colors = useColors()
  const defaultStyles = useDefaultStyles()

  const [isFocussed, setIsFocussed] = useState(false)

  const styles = useMemo(
    () =>
      StyleSheet.create({
        container: {
          gap: 4,
          marginBottom: 8,
          position: 'relative',
        },
        inputBase: {
          ...defaultStyles.bodyText,
          backgroundColor: colors.card,
          paddingHorizontal: 16,
          paddingVertical: 12,
          borderRadius: 4,
          borderWidth: 1,
          borderColor: isFocussed ? colors.primary : colors.outline,
        },
        label: {
          ...defaultStyles.detail,
        },
      }),
    [colors, isFocussed]
  )

  const hintTranslation = translate(hint as LangKey)
  const realHint = hintTranslation.startsWith('[missing') ? hint : hintTranslation

  return (
    <View style={[styles.container, containerStyle].flat()}>
      {label && <Text style={styles.label}>{label}</Text>}
      <TextInput
        defaultValue={defaultValue}
        style={[styles.inputBase, isError && { borderColor: colors.negative }, style].flat()}
        placeholderTextColor={colors.textMuted}
        onFocus={() => setIsFocussed(true)}
        onBlur={() => setIsFocussed(false)}
        selectionColor={colors.primary}
        {...props}
      />
      {endIcon}
      {hint && (
        <Text style={[defaultStyles.detailSmall, isError && { color: colors.negative }]}>
          {realHint}
        </Text>
      )}
    </View>
  )
}

export function FormTextField({
  useTransformed,
  style,
  hint,
  ...props
}: TextFieldProps & { useTransformed?: boolean }) {
  const field = useFieldContext<string, ''>()
  const data = useComputed(() => (useTransformed ? field.transformedData.value : field.data.value))
  return (
    <TextField
      {...props}
      isError={!field.isValid.value}
      hint={field.errors.value.join(', ') || hint}
      defaultValue={data.value}
      onChangeText={(text) => {
        if (useTransformed) field.handleChangeBound(text as never)
        else field.handleChange(text)
      }}
    />
  )
}
