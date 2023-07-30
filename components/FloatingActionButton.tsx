import React, { FunctionComponent } from 'react'
import { StyleProp, StyleSheet, ViewStyle } from 'react-native'
import Ripple from 'react-native-material-ripple'
import { Colors } from 'react-native-ui-lib'

interface ButtonProps {
  icon: FunctionComponent,
  style?: StyleProp<ViewStyle>,
  onPress?: () => void,
}

type Props = ButtonProps

export const FloatingActionButton: FunctionComponent<Props> = ({
                                                                 icon,
                                                                 style,
                                                                 onPress,
                                                               }) => {

  return <Ripple
    rippleContainerBorderRadius={ 16 }
    rippleColor={ Colors.onPrimaryContainer }
    // @ts-ignore
    style={ [styles.container, style] }
    onPress={ onPress }
  >
    { icon({ color: Colors.onPrimaryContainer }) }
  </Ripple>
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 16,
    right: 16,
    width: 56,
    height: 56,
    borderRadius: 16,
    elevation: 3,
    outlineProvider: 'bounds',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primaryContainer,
  },
})
