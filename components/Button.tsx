import React, { FunctionComponent, useMemo } from 'react'
import { StyleProp, StyleSheet, ViewStyle } from 'react-native'
import Ripple from 'react-native-material-ripple'
import { Colors, Text } from 'react-native-ui-lib'
import { Typography } from '../constants/Theme'

const Themes = {
  primary: {
    backgroundColor: Colors.primaryContainer,
    color: Colors.onPrimaryContainer,
  },
  tonal: {
    backgroundColor: Colors.secondaryContainer,
    color: Colors.onSecondaryContainer,
  },
}

interface ButtonProps {
  color?: keyof typeof Themes,
  disabled?: boolean,
  label: string,
  icon?: FunctionComponent,
  onClick?: () => void,
  style?: StyleProp<ViewStyle>
}

type Props = ButtonProps

export const Button: FunctionComponent<Props> = ({
                                                   color = 'tonal',
                                                   disabled,
                                                   label,
                                                   icon,
                                                   onClick,
                                                   style,
                                                 }) => {
  const colors = useMemo(() => Themes[color], [color, disabled, Themes])

  const styles = useStyles(colors.color, colors.backgroundColor, !!icon)

  return <Ripple
    rippleContainerBorderRadius={ 100 }
    rippleColor={ colors.color }
    style={ [styles.container, style] }
    onPress={ onClick }
  >
    { icon?.({ color: colors.color }) }
    <Text style={ styles.label }>{ label }</Text>
  </Ripple>
}

const useStyles = (color: string, backgroundColor: string, hasIcon: boolean) => useMemo(() => StyleSheet.create({
  container: {
    borderRadius: 100,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    height: 40,
    backgroundColor,
    paddingLeft: hasIcon ? 24 : 16,
    paddingRight: 24,
  },
  label: {
    ...Typography.LabelLarge,
    color,
    marginLeft: hasIcon ? 8 : 0,
  },
}), [color, backgroundColor, hasIcon])
