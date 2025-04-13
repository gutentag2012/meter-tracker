import { ReactNode, RefObject, useCallback, useMemo, useRef } from 'react'
import {
  SafeAreaView,
  StyleSheet,
  Text,
  TextProps,
  TouchableOpacity,
  View,
  ViewProps,
} from 'react-native'
import { ChevronDownIcon } from 'lucide-react-native'
import {
  BottomSheetBackdrop,
  BottomSheetModal,
  BottomSheetModalProvider,
  BottomSheetScrollView,
} from '@gorhom/bottom-sheet'
import { Signal } from '@preact/signals-core'
import { useColors, useDefaultStyles } from '@/modules/general/theme'
import { translate } from '@/modules/general/translations'
import { LangKey } from '@/modules/general/translations/en'
import { useSignals } from '@preact/signals-react/runtime'

export type SelectOption<T = string | number | null> = {
  value: T
  label: string
  textRight?: string | null
  description?: string | null
}

type SelectFieldProps<T = string | number | null> = Omit<ViewProps, 'style'> & {
  value: Signal<T>
  label?: string
  options: SelectOption<T>[]
  snapPoints?: (string | number)[]
  style?: TextProps['style']
  containerStyle?: ViewProps['style']
  modalTitle?: string
  ModalAction?: ReactNode
  isError?: Signal<boolean>
  hint?: string | Signal<string>
  renderField?: (props: {
    label: string
    onOpen: () => void
    selectedValue: SelectOption<T>
    hintValue: string
  }) => ReactNode
  ListHeaderComponent?: ReactNode
}

type SelectFieldPropsInternal<T = string | number | null> =
  SelectFieldProps<T> & {
    bottomSheetRef: RefObject<BottomSheetModal>
  }

export function SelectField<T = string | number | null>({
  style,
  label,
  options,
  containerStyle,
  bottomSheetRef,
  value,
  isError,
  hint,
  renderField,
  modalTitle: _,
  ModalAction: _1,
  ListHeaderComponent: _2,
  snapPoints: _3,
  ...props
}: SelectFieldPropsInternal<T>) {
  useSignals()
  const colors = useColors()
  const defaultStyles = useDefaultStyles()

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
    [colors, defaultStyles],
  )

  const selectedValue = options.find(
    (option) => option.value === value.value,
  )
  const hintValue = typeof hint === 'string' ? hint : hint?.value

  if (renderField) {
    return renderField({
      label: label ?? '',
      selectedValue: selectedValue!,
      hintValue: hintValue ?? '',
      onOpen: () => bottomSheetRef.current?.present(),
    })
  }

  return (
    <View style={[styles.inputContainer, containerStyle]}>
      {label && <Text style={styles.label}>{label}</Text>}
      <TouchableOpacity
        style={[
          styles.container,
          isError?.value && { borderColor: colors.negative },
        ]}
        onPress={() => bottomSheetRef.current?.present()}
      >
        <Text style={[styles.inputBase, style]} {...props}>
          {selectedValue?.label ?? '-'}
        </Text>
        <ChevronDownIcon size={16} stroke={colors.text} />
      </TouchableOpacity>
      {hintValue && (
        <Text
          style={[
            defaultStyles.detailSmall,
            isError?.value && { color: colors.negative },
          ]}
        >
          {translate(hintValue as LangKey, { missingBehavior: 'guess' })}
        </Text>
      )}
    </View>
  )
}

export function SelectFieldSheet<T = string | number | null>({
  snapPoints = ['50%'],
  options,
  bottomSheetRef,
  modalTitle,
  ModalAction,
  value,
  ListHeaderComponent,
}: SelectFieldPropsInternal<T>) {
  const colors = useColors()
  const renderBackdrop = useCallback(
    (props: any) => (
      <BottomSheetBackdrop
        {...props}
        onPress={() => bottomSheetRef.current?.dismiss()}
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
    [],
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
        handleIndicatorStyle={{ backgroundColor: colors.text }}
      >
        <BottomSheetScrollView
          style={{ flex: 1, paddingHorizontal: 16 }}
          contentContainerStyle={{ paddingBottom: 48 }}
        >
          <SelectFieldSheetContent
            options={options}
            bottomSheetRef={bottomSheetRef}
            modalTitle={modalTitle}
            ModalAction={ModalAction}
            value={value}
            ListHeaderComponent={ListHeaderComponent}
          />
        </BottomSheetScrollView>
      </BottomSheetModal>
    </BottomSheetModalProvider>
  )
}
export function SelectFieldSheetContent<T = string | number | null>({
  options,
  bottomSheetRef,
  modalTitle,
  ModalAction,
  value,
  ListHeaderComponent,
}: SelectFieldPropsInternal<T>) {
  useSignals()
  const colors = useColors()
  const defaultStyles = useDefaultStyles()

  const selectedValue = value.value

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
    [],
  )

  return (
        <>
          <View
            style={[
              styles.headerRow,
              {
                marginBottom: 8,
              },
            ]}
          >
            <Text style={defaultStyles.cardTitle}>{modalTitle}</Text>
            {ModalAction}
          </View>

          {ListHeaderComponent}

          {options.map((option) => (
            <TouchableOpacity
              key={`${option.value}`}
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
                  backgroundColor:
                    option.value === selectedValue
                      ? colors.background
                      : undefined,
                  borderRadius: 4,
                },
              ]}
            >
              <View style={{ marginLeft: 8, marginRight: 'auto', gap: 4 }}>
                <Text style={[defaultStyles.bodyText]}>{option.label}</Text>
                {option.description && (
                  <Text style={[defaultStyles.detailSmall]}>
                    {option.description}
                  </Text>
                )}
              </View>
              <Text style={[defaultStyles.detail, { marginRight: 8 }]}>
                {option.textRight}
              </Text>
            </TouchableOpacity>
          ))}
        </>
  )
}

export function useSelectField<T = string | number | null>(
  props: Omit<SelectFieldProps<T>, 'renderField' | 'ListHeaderComponent'>,
) {
  const bottomSheetRef = useRef<BottomSheetModal>(null)
  return useMemo(
    () => ({
      SelectField: ({
        renderField,
      }: Pick<SelectFieldProps<T>, 'renderField'>) => (
        <SelectField<T>
          {...props}
          bottomSheetRef={bottomSheetRef}
          renderField={renderField}
        />
      ),
      SelectFieldSheet: ({
        ListHeaderComponent,
      }: Pick<SelectFieldProps<T>, 'ListHeaderComponent'>) => (
        <SelectFieldSheet<T>
          {...props}
          bottomSheetRef={bottomSheetRef}
          ListHeaderComponent={ListHeaderComponent}
        />
      ),
    }),
    [props],
  )
}
