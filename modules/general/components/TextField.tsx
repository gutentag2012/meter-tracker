import { ReactNode, useEffect, useMemo, useRef, useState } from 'react'
import {
  StyleSheet,
  Text,
  TextInput,
  TextInputProps,
  View,
  ViewProps,
} from 'react-native'
import { useFieldContext } from '@formsignals/form-react'
import { useComputed } from '@preact/signals-react'
import { useColors, useDefaultStyles } from '@/modules/general/theme'
import { translate } from '@/modules/general/translations'
import { LangKey } from '@/modules/general/translations/en'

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

  const inputRef = useRef<TextInput>(null)
  const [isFocussed, setIsFocussed] = useState(false)

  // This is a workaround for the autoFocus prop not working with selectTextOnFocus
  const [selectedLength, setSelectedLength] = useState(0)
  useEffect(() => {
    const lengthToSelect = defaultValue?.length ?? 0
    if (
      !props.autoFocus ||
      !inputRef.current ||
      !props.selectTextOnFocus ||
      selectedLength <= lengthToSelect
    ) {
      return
    }
    setSelectedLength(lengthToSelect)
    setTimeout(() => {
      inputRef.current?.setSelection(0, lengthToSelect)
      inputRef.current?.focus()
    }, 0)
  }, [
    defaultValue?.length,
    inputRef,
    selectedLength,
    props.autoFocus,
    props.selectTextOnFocus,
  ])

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
    [colors, defaultStyles, isFocussed],
  )

  const hintTranslation = translate(hint as LangKey)
  const realHint = hintTranslation.startsWith('[missing')
    ? hint
    : hintTranslation

  return (
    <View style={[styles.container, containerStyle].flat()}>
      {label && <Text style={styles.label}>{label}</Text>}
      <TextInput
        ref={inputRef}
        defaultValue={defaultValue}
        style={[
          styles.inputBase,
          isError && { borderColor: colors.negative },
          style,
        ].flat()}
        placeholderTextColor={colors.textMuted}
        onFocus={() => setIsFocussed(true)}
        onBlur={() => setIsFocussed(false)}
        selectionColor={colors.primary}
        {...props}
      />
      {endIcon}
      {hint && (
        <Text
          style={[
            defaultStyles.detailSmall,
            isError && { color: colors.negative },
          ]}
        >
          {realHint}
        </Text>
      )}
    </View>
  )
}

export function FormTextField({
  useTransformed,
  hint,
  ...props
}: TextFieldProps & { useTransformed?: boolean }) {
  const field = useFieldContext<string, ''>()
  const data = useComputed(() =>
    useTransformed ? field.transformedData.value : field.data.value,
  )
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
