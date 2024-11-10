import { useColors, useDefaultStyles } from '@/lib/constants/theme'
import { Component, ReactNode, RefObject, useCallback, useMemo, useRef, useState } from 'react'
import {
  StyleSheet,
  Text,
  TextInput,
  TextInputProps,
  TouchableOpacity,
  View,
  ViewProps,
} from 'react-native'
import { ChevronDownIcon, PencilIcon, PlusIcon } from 'lucide-react-native'
import {
  BottomSheetBackdrop,
  BottomSheetModal,
  BottomSheetModalProvider,
  BottomSheetScrollView,
} from '@gorhom/bottom-sheet'
import { translate } from '@/lib/translations/i18n'
import { activeBuilding } from '@/modules/buildings/buildings.signals'
import { markBuildingAsDefault } from '@/modules/buildings/buildings.query'
import { Signal } from '@preact/signals-core'
import { LangKey } from '@/lib/translations/en'

type SelectFieldProps = ViewProps & {
  value: Signal<string | number | null>
  label?: string
  options: {
    value: string | number | null
    label: string
    textRight?: string | null
    description?: string | null
  }[]
  snapPoints?: (string | number)[]
  containerStyle?: ViewProps['style']
  modalTitle?: string
  ModalAction?: ReactNode
  isError?: Signal<boolean>
  hint?: string | Signal<string>
}

type SelectFieldPropsInternal = SelectFieldProps & {
  bottomSheetRef: RefObject<BottomSheetModal>
}

export function SelectField({
  style,
  label,
  snapPoints = ['50%'],
  options,
  containerStyle,
  bottomSheetRef,
  value,
  isError,
  hint,
  modalTitle: _,
  ModalAction: _1,
  ...props
}: SelectFieldPropsInternal) {
  const colors = useColors()
  const defaultStyles = useDefaultStyles()

  const selectedValueOption = options.find((option) => option.value === value.value)

  const styles = useMemo(
    () =>
      StyleSheet.create({
        inputContainer: {
          gap: 4,
          marginBottom: 8,
        },
        inputBase: {
          ...defaultStyles.bodyText,
          marginRight: 'auto',
          paddingRight: 8,
        },
        container: {
          backgroundColor: colors.card,
          paddingHorizontal: 16,
          paddingVertical: 12,
          borderRadius: 4,
          borderWidth: 1,
          borderColor: colors.outline,
          flexDirection: 'row',
          alignItems: 'center',
        },
        label: {
          ...defaultStyles.detail,
        },
      }),
    [colors, defaultStyles]
  )

  const hintValue = typeof hint === 'string' ? hint : hint?.value

  return (
    <View style={[styles.inputContainer, containerStyle]}>
      {label && <Text style={styles.label}>{label}</Text>}
      <TouchableOpacity
        style={[styles.container, isError?.value && { borderColor: colors.negative }]}
        onPress={() => bottomSheetRef.current?.present()}>
        <Text style={[styles.inputBase, style]} {...props}>
          {selectedValueOption?.label ?? '-'}
        </Text>
        <ChevronDownIcon size={16} stroke={colors.text} />
      </TouchableOpacity>
      {hintValue && (
        <Text style={[defaultStyles.detailSmall, isError?.value && { color: colors.negative }]}>
          {translate(hintValue as LangKey, { missingBehavior: 'guess' })}
        </Text>
      )}
    </View>
  )
}

export function SelectFieldSheet({
  snapPoints = ['50%'],
  options,
  bottomSheetRef,
  modalTitle,
  ModalAction,
  value,
}: SelectFieldPropsInternal) {
  const colors = useColors()
  const defaultStyles = useDefaultStyles()

  const selectedValue = value.value

  const renderBackdrop = useCallback(
    (props: any) => (
      <BottomSheetBackdrop
        {...props}
        disappearsOnIndex={-1}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
        }}
      />
    ),
    []
  )

  const styles = useMemo(
    () =>
      StyleSheet.create({
        headerRow: {
          flexDirection: 'row',
          alignItems: 'center',
          paddingRight: 4,
          gap: 8,
          marginTop: 8,
          marginBottom: 16,
        },
      }),
    [colors]
  )

  return (
    <BottomSheetModalProvider>
      <BottomSheetModal
        ref={bottomSheetRef}
        index={0}
        backdropComponent={renderBackdrop}
        snapPoints={snapPoints}
        enableDynamicSizing={false}
        backgroundStyle={{ backgroundColor: colors.card }}
        handleIndicatorStyle={{ backgroundColor: colors.text }}>
        <BottomSheetScrollView style={{ flex: 1, minHeight: 500, paddingHorizontal: 16 }}>
          <View
            style={[
              styles.headerRow,
              {
                marginBottom: 8,
              },
            ]}>
            <Text style={defaultStyles.cardTitle}>{modalTitle}</Text>
            {ModalAction}
          </View>

          {options.map((option) => (
            <TouchableOpacity
              key={option.value}
              onPress={() => {
                value.value = option.value
                bottomSheetRef.current?.dismiss()
              }}
              style={[
                defaultStyles.row,
                {
                  padding: 8,
                  alignItems: 'center',
                  gap: 0,
                  backgroundColor: option.value === selectedValue ? colors.background : undefined,
                  borderRadius: 4,
                },
              ]}>
              <View style={{ marginLeft: 8, marginRight: 'auto', gap: 4 }}>
                <Text style={[defaultStyles.bodyText]}>{option.label}</Text>
                {option.description && (
                  <Text style={[defaultStyles.detailSmall]}>{option.description}</Text>
                )}
              </View>
              <Text style={[defaultStyles.detail, { marginRight: 8 }]}>{option.textRight}</Text>
            </TouchableOpacity>
          ))}
        </BottomSheetScrollView>
      </BottomSheetModal>
    </BottomSheetModalProvider>
  )
}

export function useSelectField(props: SelectFieldProps) {
  const bottomSheetRef = useRef<BottomSheetModal>(null)
  return useMemo(
    () => ({
      SelectField: () => <SelectField {...props} bottomSheetRef={bottomSheetRef} />,
      SelectFieldSheet: () => <SelectFieldSheet {...props} bottomSheetRef={bottomSheetRef} />,
    }),
    [props]
  )
}
