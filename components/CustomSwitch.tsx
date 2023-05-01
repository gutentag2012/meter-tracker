import React, { ForwardedRef, FunctionComponent } from 'react'
import { Colors, Switch } from 'react-native-ui-lib'

interface InputProps {
  value?: boolean
  disabled?: boolean
}

type Props = InputProps

export const CustomSwitch: FunctionComponent<Props> = React.forwardRef(({ value, disabled }, ref: ForwardedRef<any>) => {
  return <Switch
    disabled={disabled}
    style={ {
      marginLeft: 'auto',
      marginRight: 16,
      borderWidth: 2,
      borderColor: !value ? Colors.outline : Colors.primary,
    } }
    value={ value }
    onColor={ Colors.primary }
    offColor={ Colors.surfaceVariant }
    thumbStyle={ {
      backgroundColor: value ? Colors.onPrimary : Colors.outline,
      marginLeft: value ? -2 : 2,
      width: (value ? 20 : 12),
      height: (value ? 20 : 12),
      borderRadius: (value ? 20 : 12) / 2,
    } }
  />
})
