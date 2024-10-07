import React, { type ReactElement } from 'react'
import { StyleSheet } from 'react-native'
import Ripple from 'react-native-material-ripple'
import { Colors, DateTimePicker, Text, View } from 'react-native-ui-lib'
import Layout from '../constants/Layout'
import { Typography } from '../setupTheme'
import { CustomSwitch } from './CustomSwitch'
import { type Signal } from '@preact/signals-react'

type SettingsType = 'text' | 'email-address' | 'checkbox' | 'date' | 'time' | 'custom'

type SettingsListEntryProps<T = unknown> = {
  type: SettingsType
  onPress?: (value?: T) => void // Returns new value
  getIcon?: () => ReactElement
  value?: Signal<T>
  title: string
  getSubTitle: (value?: T) => string
  disabled?: boolean
  customHeight?: number
}

type SubProps<T = unknown> = {
  type?: SettingsType
  children?: ReactElement | Array<ReactElement | undefined | boolean> | undefined | boolean
  onChange?: (value?: T) => void
  value?: Signal<T>
  disabled?: boolean
  customHeight?: number
}

const SettingsListEntryContainer = <T = unknown,>({
  type,
  children,
  onChange,
  value,
  disabled,
  customHeight,
}: SubProps<T>) => {
  return type !== 'time' && type !== 'date' ? (
    <Ripple
      rippleColor={Colors.primary}
      onPress={() => onChange?.()}
      style={[styles.container, { opacity: disabled ? 0.6 : 1, height: customHeight ?? 56 }]}
      disabled={disabled}
    >
      {children}
    </Ripple>
  ) : (
    <DateTimePicker
      editable={!disabled}
      mode={type}
      dateFormat="DD/MM/yyyy"
      timeFormat="HH:mm"
      value={value?.value as Date | undefined}
      onChange={(date: Date) => onChange?.(date as T)}
      renderInput={() => <View style={styles.container}>{children}</View>}
    />
  )
}

export const SettingsListEntry = <T = unknown,>({
  title,
  getSubTitle,
  type,
  onPress,
  getIcon,
  value,
  disabled,
  customHeight,
}: SettingsListEntryProps<T>) => {
  return (
    <SettingsListEntryContainer<T>
      type={type}
      onChange={onPress}
      value={value}
      disabled={disabled}
      customHeight={customHeight}
    >
      <View
        style={{
          width: 48,
          height: 48,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {getIcon?.()}
      </View>
      <View>
        <Text style={styles.title} onSurface>
          {title}
        </Text>
        <Text style={styles.subtitle} onSurface>
          {getSubTitle(value?.value)}
        </Text>
      </View>
      {type === 'checkbox' && <CustomSwitch value={!!value?.value} />}
    </SettingsListEntryContainer>
  )
}

const styles = StyleSheet.create({
  container: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
  },
  title: {
    ...Typography.BodyLarge,
  },
  subtitle: {
    ...Typography.BodySmall,
    maxWidth: Layout.window.width - 96 - 24,
  },
})
