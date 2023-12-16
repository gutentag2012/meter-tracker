import React, {
  type Component,
  type ForwardedRef,
  forwardRef,
  type FunctionComponent,
  type MutableRefObject,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from 'react'
import { type StyleProp, type ViewStyle } from 'react-native'
import { Colors, Incubator, Text, type TextFieldProps, View } from 'react-native-ui-lib'
import { Typography } from '../setupTheme'

export type InputRef = {
  isValid: () => boolean
  validate: () => void
}

interface InputProps {
  label?: string
  onChange?: (text: string) => void
  value?: string
  initialValue?: string
  onChangeText?: (text: string) => void
  validation?: Array<string | ((value: string) => boolean)>
  validationMessages?: Array<string>
  hint?: string
  onSubmit?: () => void
  inputType?: 'default' | 'numeric' | 'text' | 'email-address'
  outerContainerStyle?: StyleProp<ViewStyle>
  innerContainerStyle?: StyleProp<ViewStyle>
  ref?: ForwardedRef<InputRef>
  textFieldProps?: TextFieldProps
}

type Props = InputProps

export const Input: FunctionComponent<Props> = forwardRef(
  (
    {
      label,
      onChange,
      value: givenValue,
      initialValue,
      onChangeText,
      validation,
      validationMessages,
      inputType,
      onSubmit,
      hint,
      outerContainerStyle,
      innerContainerStyle,
      textFieldProps,
    },
    ref: ForwardedRef<InputRef>
  ) => {
    const inputRef = useRef<Incubator.TextFieldRef>()
    const firstRender = useRef(true)

    const [isFocussed, setIsFocussed] = useState(false)
    const [value, setValue] = useState(initialValue ?? '')

    // It may not be valid from the start, but it is not checked from the start
    const [isValid, setIsValid] = useState(true)

    useEffect(() => {
      if (firstRender.current) {
        firstRender.current = false
        return
      }
      // Once the value changes check if the field is still valid
      setIsValid(inputRef.current?.isValid() ?? false)
    }, [value, label])

    useImperativeHandle(
      ref,
      (): InputRef => {
        return {
          isValid: () => !!inputRef.current?.isValid(),
          validate: () => {
            inputRef.current?.validate()
            setIsValid(inputRef.current?.isValid() ?? false)
          },
        }
      },
      []
    )

    return (
      <View style={outerContainerStyle}>
        <Incubator.TextField
          {...textFieldProps}
          defaultValue={initialValue}
          ref={inputRef as MutableRefObject<Component>}
          onChange={onChange}
          {...(givenValue ? { value: givenValue } : {})}
          placeholder={label}
          keyboardType={inputType}
          floatingPlaceholder
          onChangeText={(text: string) => {
            setValue(text)
            onChangeText?.(text)
          }}
          onFocus={() => setIsFocussed(true)}
          onBlur={() => {
            setIsFocussed(false)
            setIsValid(inputRef.current?.isValid() ?? false)
          }}
          floatOnFocus
          onSubmitEditing={onSubmit}
          validateOnChange
          validateOnBlur
          validate={validation}
          validationMessage={validationMessages}
          validationMessageStyle={{
            ...Typography.LabelSmall,
            marginTop: 12,
            color: Colors.error,
          }}
          cursorColor={Colors.primary}
          selectionColor={Colors.primary}
          floatingPlaceholderColor={{
            default: Colors.onSurface,
            focus: Colors.primary,
            error: Colors.error,
            disabled: Colors.outline,
          }}
          floatingPlaceholderStyle={
            isFocussed || !!value || !!givenValue
              ? { ...Typography.BodySmall }
              : {
                  ...Typography.BodyLarge,
                  bottom: 4,
                }
          }
          enableErrors
          fieldStyle={{
            paddingHorizontal: 16,
          }}
          style={{
            ...Typography.BodyLarge,
          }}
          containerStyle={[
            {
              height: 56,
              borderBottomWidth: 1,
              borderColor: Colors.outline,
              backgroundColor: Colors.surfaceVariant,
              borderTopLeftRadius: 2,
              borderTopRightRadius: 2,
              marginBottom: 24,
            },
            innerContainerStyle,
          ]}
        />
        <Text
          style={{
            ...Typography.LabelSmall,
            marginTop: -20,
            marginBottom: 12,
          }}
        >
          {hint && isValid ? hint : ''}
        </Text>
      </View>
    )
  }
)
