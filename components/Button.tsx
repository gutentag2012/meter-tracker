import React, { FunctionComponent, useMemo } from 'react'
import { StyleProp, StyleSheet, ViewStyle } from 'react-native'
import Ripple from 'react-native-material-ripple'
import { Colors, Text } from 'react-native-ui-lib'
import { Typography } from '../setupTheme'

const Themes = {
  primary: {
    backgroundColor: Colors.primaryContainer,
    color: Colors.onPrimaryContainer,
    hasBorder: false,
  },
  error: {
    backgroundColor: Colors.errorContainer,
    color: Colors.onErrorContainer,
    hasBorder: false,
  },
  tonal: {
    backgroundColor: Colors.secondaryContainer,
    color: Colors.onSecondaryContainer,
    hasBorder: false,
  },
  outline: {
    backgroundColor: 'transparent',
    color: Colors.primary,
    hasBorder: true,
  },
}

export type ButtonVariants = keyof typeof Themes

interface ButtonProps {
  color?: ButtonVariants,
  disabled?: boolean,
  label: string,
  icon?: FunctionComponent,
  onPress?: () => void,
  style?: StyleProp<ViewStyle>
  isSmall?: boolean
}

type Props = ButtonProps

export const Button: FunctionComponent<Props> = ({
                                                   color = 'tonal',
                                                   disabled,
                                                   label,
                                                   icon,
                                                   onPress,
                                                   style,
                                                   isSmall,
                                                 }) => {
  const colors = useMemo(() => Themes[color], [color, Themes])

  const styles = useStyles(colors.color, colors.backgroundColor, colors.hasBorder, !!icon, isSmall, disabled)

  return <Ripple
    rippleContainerBorderRadius={ 100 }
    rippleColor={ colors.color }
    // @ts-ignore
    style={ [styles.container, style] }
    onPress={ onPress }
    disabled={ disabled }
  >
    { icon?.({
      color: colors.color,
      size: isSmall ? 12 : undefined,
    }) }
    <Text style={ styles.label }>{ label }</Text>
  </Ripple>
}

const useStyles = (
  color: string, backgroundColor: string, hasBorder = false, hasIcon: boolean, isSmall?: boolean,
  disabled?: boolean,
) => useMemo(() => {
  const paddingLarge = isSmall ? 16 : 24
  const paddingSmall = isSmall ? 12 : 16
  return StyleSheet.create({
    container: {
      borderRadius: isSmall ? 8 : 100,
      alignItems: 'center',
      justifyContent: 'center',
      flexDirection: 'row',
      height: isSmall ? 24 : 40,
      backgroundColor,
      borderWidth: +hasBorder,
      borderColor: color,
      paddingLeft: hasIcon ? paddingLarge : paddingSmall,
      paddingRight: paddingLarge,
      opacity: disabled ? .6 : 1,
    },
    label: {
      ...Typography.LabelLarge,
      color,
      fontSize: isSmall ? 12 : Typography.LabelLarge.fontSize,
      marginLeft: hasIcon ? 8 : 0,
    },
  })
}, [color, backgroundColor, hasBorder, hasIcon, isSmall, disabled])
