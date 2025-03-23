import { useMemo } from 'react'
import {
  StyleSheet,
  Text,
  TouchableOpacity, TouchableOpacityProps,
  View,
  ViewProps,
} from 'react-native'
import { Signal } from '@preact/signals-core'
import { useFieldContext } from '@formsignals/form-react'
import {
  AndroidNativeProps,
  DateTimePickerAndroid,
} from '@react-native-community/datetimepicker'
import {CalendarIcon, FileIcon, FileSearchIcon} from 'lucide-react-native'
import { useColors, useDefaultStyles } from '@/modules/general/theme'
import { formatDate, translate } from '@/modules/general/translations'
import { LangKey } from '@/modules/general/translations/en'
import {DocumentPickerAsset, DocumentPickerResult} from "expo-document-picker";
import * as DocumentPicker from "expo-document-picker";
import {readAsStringAsync} from "expo-file-system";
import {parseCSV} from "@/modules/settings/serialization";

type FilePickerProps = Omit<TouchableOpacityProps, 'value' | 'onChange'> & {
  label?: string
  value: string
  onSelect: (value: DocumentPickerAsset) => void
  containerStyle?: ViewProps['style']
  isError?: boolean
  hint?: string
  disabled?: boolean
  type?: string | string[]
  copyToCacheDirectory?: boolean
  multiple?: false
  maxSize?: number
}

export function FilePicker({
  style,
  label,
  value,
  onSelect,
  containerStyle,
  hint,
  isError,
  disabled,
  type,
  copyToCacheDirectory,
  multiple,
  maxSize = 1_000_000,
  ...props
}: FilePickerProps) {
  const colors = useColors()
  const defaultStyles = useDefaultStyles()

  const styles = useMemo(
    () =>
      StyleSheet.create({
        container: {
          opacity: disabled ? 0.5 : 1,
        },
        inputBase: {
          ...defaultStyles.bodyText,
          backgroundColor: colors.card,
          paddingHorizontal: 8,
          paddingVertical: 8,
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
    [disabled, colors, defaultStyles],
  )

  const hintTranslation = translate(hint as LangKey)
  const realHint = hintTranslation.startsWith('[missing')
    ? hint
    : hintTranslation

  return (
    <View style={[styles.container, containerStyle].flat()}>
      {label && <Text style={styles.label}>{label}</Text>}
      <TouchableOpacity
        style={[
          styles.inputBase,
          isError && { borderColor: colors.negative },
          style,
        ].flat()}
        onPress={() => {
          DocumentPicker.getDocumentAsync({
            type,
            multiple,
            copyToCacheDirectory
          }).then(async res => {
            if (res.canceled || !res.assets[0]) return
            const file = res.assets[0]

            if (!file.size || file.size > maxSize) {
              console.error("File too large")
              return
            }

            onSelect(file)
          })
        }}
        {...props}
      >
        <FileSearchIcon size={16} color={colors.textStatic} />
        {value && <Text style={[defaultStyles.bodyText, disabled && styles.disabled]}>
          {value}
        </Text>}
        {!value && <Text style={[defaultStyles.bodyText, {color: colors.textMuted}]}>
          Please select a file
        </Text>}
      </TouchableOpacity>
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

export function FormFilePicker({
  useTransformed,
  hint,
  ...props
}: Omit<FilePickerProps, 'value'> & { useTransformed?: boolean }) {
  const field = useFieldContext<string, '', string>()
  return (
    <FilePicker
      {...props}
      value={useTransformed ? field.transformedData.value : field.data.value}
      isError={!field.isValid.value}
      hint={field.errors.value.join(', ') || hint}
    />
  )
}
