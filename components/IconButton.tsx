import React, { FunctionComponent, ReactElement } from 'react'
import { StyleProp, ViewStyle } from 'react-native'
import Ripple from 'react-native-material-ripple'
import { Colors, View } from 'react-native-ui-lib'

interface IconButtonProps {
  getIcon: () => ReactElement
  rippleColor?: string,
  onPress?: () => void,
  style?: StyleProp<ViewStyle>
}

type Props = IconButtonProps

export const IconButton: FunctionComponent<Props> = ({
                                                       getIcon,
                                                       rippleColor,
                                                       onPress,
                                                       style,
                                                     }) => {
  return <View style={ style }>
    <Ripple
      rippleColor={ rippleColor ?? Colors.onBackground }
      rippleContainerBorderRadius={ 100 }
      rippleCentered
      onPress={ onPress }
      style={ { padding: 8 } }
    >
      { getIcon() }
    </Ripple>
  </View>
}
