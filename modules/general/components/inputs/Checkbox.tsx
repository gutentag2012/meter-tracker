import {
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableOpacityProps, View,
} from 'react-native'
import { forwardRef, PropsWithChildren, ReactNode, useMemo } from 'react'
import { useColors, useDefaultStyles } from '@/modules/general/theme'
import {CheckIcon, XIcon} from "lucide-react-native";
import {useFieldContext} from "@formsignals/form-react";
import { useSignals } from '@preact/signals-react/runtime'

type CheckboxProps = Omit<TouchableOpacityProps, "children"> & {
  label?: string
  isChecked?: boolean
  onChange?: (isChecked: boolean) => void
}

export const Checkbox = function (
  {
    label,
    style,
    isChecked,
    onChange,
    ...props
  }: CheckboxProps
) {
  const colors = useColors()
  const defaultStyles = useDefaultStyles()

  const styles = useMemo(
    () =>
      StyleSheet.create({
        container: {
          flexDirection: 'row',
          alignItems: 'center',
          gap: 8
        },
        checkboxOuter: {
          width: 20,
          height: 20,
          borderRadius: 4,
          borderWidth: 1,
          borderColor: colors.outline,
          justifyContent: 'center',
          alignItems: 'center',
        },
        label: {
          ...defaultStyles.detail,
          color: colors.text,
        }
      }),
    [colors, defaultStyles],
  )

  return (
    <TouchableOpacity
      style={[styles.container, style]}
      {...props}
      onPress={() => onChange && onChange(!isChecked)}
    >
      <View style={styles.checkboxOuter}>
        {isChecked && <XIcon size={defaultStyles.bodyText.fontSize} stroke={colors.text} />}
      </View>
      <Text style={styles.label}>{label}</Text>
    </TouchableOpacity>
  )
}
Checkbox.displayName = 'Checkbox'

export function CheckboxForm(props: Omit<CheckboxProps, "isChecked" | "onChange">) {
  useSignals()
  const field = useFieldContext<boolean, "">()
  return (
    <Checkbox
      isChecked={field.data.value}
      onChange={field.handleChange}
      {...props}
    />
  )
}
