import React, { FunctionComponent, useEffect, useState } from 'react'
import { ActivityIndicator } from 'react-native'
import { Colors, Incubator, Text, ToastProps, View } from 'react-native-ui-lib'
import EventEmitter from '../services/events'
import { Button, ButtonVariants } from './Button'
import { IconBaseProps } from './icons/IconBase'
import { NotificationIcon } from './icons/NotificationIcon'

export interface GlobalToast {
  message: string
  duration?: number
  isLoading?: boolean
  onDismiss?: () => void
  icon?: React.FunctionComponent<IconBaseProps>
  colors?: {
    background: string
    text: string
    button: ButtonVariants
  }
  action?: {
    label: string
    onPress: () => void
  }
}

type Props = {
  renderAttachment?: ToastProps['renderAttachment']
}

export const GlobalToast: FunctionComponent<Props> = ({ renderAttachment }) => {
  const [toast, setToast] = useState<GlobalToast | undefined>(undefined)

  useEffect(() => {
    const listener = (toastProps?: GlobalToast) => {
      setToast(toastProps)
    }
    setToast(EventEmitter.lastToast)

    EventEmitter.subscribe(`global-toast`, listener)
    return () => {
      EventEmitter.unsubscribe(`global-toast`, listener)
    }
  }, [])

  const ToastIcon = toast?.icon ? toast.icon : NotificationIcon

  return <Incubator.Toast
    visible={ !!toast }
    position={ 'bottom' }
    onDismiss={ () => {
      EventEmitter.emitToast(undefined)
      if (toast?.onDismiss) {
        toast.onDismiss()
      }
    } }
    enableHapticFeedback
    swipable
    renderAttachment={ renderAttachment }
  >
    <View
      style={ {
        borderRadius: 8,
        backgroundColor: toast?.colors?.background ?? Colors.secondaryContainer,
        marginHorizontal: 16,
        marginBottom: 16,
        paddingLeft: 16,
        paddingRight: toast?.icon ? 8 : 16,
        height: 48,
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
      } }
    >
      <ToastIcon
        size={ 24 }
        color={ toast?.colors?.text ?? Colors.onSecondaryContainer }
      />
      <Text
        style={ {
          color: toast?.colors?.text ?? Colors.onSecondaryContainer,
          marginLeft: 8,
          marginRight: 'auto',
        } }
      >
        { toast?.message }
      </Text>
      {
        toast?.action && !toast?.isLoading &&
          <Button
              label={ toast.action.label }
              color={ toast.colors?.button ?? 'tonal' }
              isSmall
              onPress={ toast.action.onPress }
          />
      }
      {
        toast?.isLoading &&
          <ActivityIndicator
              size={ 'small' }
              animating
              color={ Colors.onSecondaryContainer }
          />
      }
    </View>
  </Incubator.Toast>
}
