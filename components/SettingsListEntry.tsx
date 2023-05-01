import { StatusBar } from 'expo-status-bar'
import React, { FunctionComponent, ReactElement, Ref, useRef, useState } from 'react'
import { Platform, StyleSheet } from 'react-native'
import Ripple from 'react-native-material-ripple'
import { Colors, DateTimePicker, Dialog, Text, View } from 'react-native-ui-lib'
import { Typography } from '../constants/Theme'
import { CustomSwitch } from './CustomSwitch'
import { Input } from './Input'

type SettingsType = 'text' | 'email-address' | 'checkbox' | 'date' | 'time' | 'custom'
interface SettingsListEntryProps {
  type: SettingsType
  onPress?: (value?: any) => void // Returns new value
  getIcon?: () => ReactElement
  value?: any
  title: string
  getSubTitle: (value: any) => string
  disabled?: boolean
}

type Props = SettingsListEntryProps

type SubProps = {
  type?: SettingsType,
  children?: ReactElement | Array<ReactElement | undefined | boolean> | undefined | boolean,
  onChange?: (value?: any) => void,
  value: any,
  disabled?: boolean
}

const SettingsListEntryContainer: FunctionComponent<SubProps> = ({
                                                                   type,
                                                                   children,
                                                                   onChange,
                                                                   value,
                                                                   disabled,
                                                                 }) => {

  return type !== 'time' && type !== 'date' ?
         <Ripple
           rippleColor={ Colors.primary }
           onPress={ () => onChange?.() }
           style={ [styles.container, { opacity: disabled ? 0.6 : 1 }] }
           disabled={ disabled }
         >
           { children }
         </Ripple> :
         <DateTimePicker
           disabled={ disabled }
           mode={ type }
           dateFormat={ 'DD/MM/yyyy' }
           timeFormat={ 'HH:mm' }
           value={ value }
           onChange={ (date: Date) => onChange?.(date) }
           renderInput={ () => <View style={ styles.container }>{ children }</View> }
         />
}

export const SettingsListEntry: FunctionComponent<Props> = ({
                                                              title,
                                                              getSubTitle,
                                                              type,
                                                              onPress,
                                                              getIcon,
                                                              value,
                                                              disabled,
                                                            }) => {

  return <SettingsListEntryContainer
    type={ type }
    onChange={ onPress }
    value={ value }
    disabled={ disabled }
  >
    <View
      style={ {
        width: 48,
        height: 48,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      } }
    >
      { getIcon?.() }
    </View>
    <View>
      <Text
        style={ styles.title }
        onSurface
      >
        { title }
      </Text>
      <Text
        style={ styles.subtitle }
        onSurfaceVariant
      >
        { getSubTitle(value) }
      </Text>
    </View>
    {
      type === 'checkbox' && <CustomSwitch value={ value } />
    }
  </SettingsListEntryContainer>
}

const styles = StyleSheet.create({
  container: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    height: 56,
  },
  title: {
    ...Typography.BodyLarge,
  },
  subtitle: {
    ...Typography.BodySmall,
  },
})
