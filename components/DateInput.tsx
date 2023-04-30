import React, { ForwardedRef, FunctionComponent } from 'react'
import { StyleProp, ViewStyle } from 'react-native'
import { Colors, DateTimePicker, Incubator, TextFieldProps } from 'react-native-ui-lib'
import { Typography } from '../constants/Theme'
import { Input } from './Input'

interface InputProps {
  label?: string,
  onChange?: (date: Date) => void,
  validation?: Array<string | ((value: string) => boolean)>,
  validationMessages?: Array<string>,
  onSubmit?: () => void,
  value?: Date,
  outerContainerStyle?: StyleProp<ViewStyle>,
  innerContainerStyle?: StyleProp<ViewStyle>,
  ref?: ForwardedRef<any>,
  textFieldProps?: TextFieldProps
}

type Props = InputProps

export const DateInput: FunctionComponent<Props> = React.forwardRef(({
                                                                       label,
                                                                       onChange,
                                                                       validation,
                                                                       validationMessages,
                                                                       value,
                                                                       onSubmit,
                                                                       outerContainerStyle,
                                                                       innerContainerStyle,
                                                                       textFieldProps,
                                                                     }, ref: ForwardedRef<any>) => {
  return <DateTimePicker
    { ...textFieldProps }
    onChange={ (date: Date) => {
      onChange?.(date)
    } }
    dateFormat={"DD/MM/yyyy"}
    value={ value }
    renderInput={ (props: any) => <Input
      { ...props }
      ref={ ref }
      hint="dd/mm/yyyy"
      placeholder={ label }
      label={ label }
      floatingPlaceholder
      floatOnFocus
      onSubmitEditing={ onSubmit }
      validateOnChange
      validation={ validation }
      validationMessages={ validationMessages }
      outerContainerStyle={ outerContainerStyle }
      innerContainerStyle={ innerContainerStyle }
    /> }
  />
})
