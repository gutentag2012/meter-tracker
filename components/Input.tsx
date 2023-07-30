import React, {
  Component,
  ForwardedRef,
  FunctionComponent,
  MutableRefObject,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from 'react'
import { StyleProp, ViewStyle } from 'react-native'
import { Colors, Incubator, Text, TextFieldProps, View } from 'react-native-ui-lib'
import { Typography } from '../setupTheme'

interface InputProps {
  label?: string,
  onChange?: (text: string) => void,
  value?: string,
  initialValue?: string,
  onChangeText?: (text: string) => void,
  validation?: Array<string | ((value: string) => boolean)>,
  validationMessages?: Array<string>,
  hint?: string,
  onSubmit?: () => void,
  inputType?: 'default' | 'numeric' | 'text' | 'email-address',
  outerContainerStyle?: StyleProp<ViewStyle>,
  innerContainerStyle?: StyleProp<ViewStyle>,
  ref?: ForwardedRef<any>,
  textFieldProps?: TextFieldProps
}

type Props = InputProps

export const Input: FunctionComponent<Props> = React.forwardRef(({
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
                                                                 }, ref: ForwardedRef<any>) => {
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
    () => {
      return {
        isValid: () => inputRef.current?.isValid(),
        validate: () => {
          inputRef.current?.validate()
          setIsValid(inputRef.current?.isValid() ?? false)
        },
      }
    },
    [],
  )

  // TODO Figure out how to hide the hint when there is a validation message shown
  return <View style={ outerContainerStyle }>
    <Incubator.TextField
      { ...textFieldProps }
      defaultValue={ initialValue }
      ref={ inputRef as MutableRefObject<Component> }
      onChange={ onChange }
      { ...(givenValue ? { value: givenValue } : {}) }
      placeholder={ label }
      keyboardType={ inputType }
      floatingPlaceholder
      onChangeText={ (text: string) => {
        setValue(text)
        onChangeText?.(text)
      } }
      onFocus={ () => setIsFocussed(true) }
      onBlur={ () => {
        setIsFocussed(false)
        setIsValid(inputRef.current?.isValid() ?? false)
      } }
      floatOnFocus
      onSubmitEditing={ onSubmit }
      validateOnChange
      validateOnBlur
      validate={ validation }
      validationMessage={ validationMessages }
      validationMessageStyle={ {
        marginTop: 8,
        color: Colors.error,
        ...Typography.BodySmall,
      } }
      cursorColor={ Colors.primary }
      selectionColor={ Colors.primary }
      floatingPlaceholderColor={ {
        default: Colors.onSurface,
        focus: Colors.primary,
        error: Colors.error,
        disabled: Colors.outline,
      } }
      floatingPlaceholderStyle={ isFocussed || !!value || !!givenValue ? { ...Typography.BodySmall } : {
        ...Typography.BodyLarge,
        bottom: 4,
      } }
      enableErrors
      fieldStyle={ {
        paddingHorizontal: 16,
      } }
      style={ {
        ...Typography.BodyLarge,
      } }
      containerStyle={ [
        {
          height: 56,
          borderBottomWidth: 1,
          borderColor: Colors.outline,
          backgroundColor: Colors.surfaceVariant,
          borderTopLeftRadius: 2,
          borderTopRightRadius: 2,
          marginBottom: 16,
        }, innerContainerStyle,
      ] }
    />
    { (hint) && <Text
        style={ {
          ...Typography.LabelSmall,
          marginTop: isValid ? -8 : 8,
          marginBottom: 16,
        } }
    >
      { hint }
    </Text> }
  </View>
})
