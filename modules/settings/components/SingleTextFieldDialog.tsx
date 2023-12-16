import { StatusBar } from 'expo-status-bar'
import React, { type FunctionComponent, useEffect, useRef } from 'react'
import { Platform, StyleSheet } from 'react-native'
import Ripple from 'react-native-material-ripple'
import { Colors, Dialog, Text, View } from 'react-native-ui-lib'
import { Input } from '../../../components/Input'
import { t } from '@/i18n'
import { Typography } from '../../../setupTheme'

export interface SingleTextFieldDialogProps {
  label?: string
  inputType?: 'default' | 'email-address' | 'numeric' | 'text'
  initialValue?: string
  onFinish?: (text: string) => void
  isVisible: boolean
  onDismiss: () => void
}

type Props = SingleTextFieldDialogProps

export const SingleTextFieldDialog: FunctionComponent<Props> = ({
  label,
  initialValue,
  inputType = 'default',
  onFinish,
  isVisible,
  onDismiss,
}) => {
  const value = useRef(initialValue)

  useEffect(() => {
    value.current = initialValue
  }, [initialValue])

  return (
    <Dialog
      onDismiss={onDismiss}
      visible={isVisible}
      width="100%"
      centerH
      centerV
      disablePan
      ignoreBackgroundPress
      overlayBackgroundColor={Colors.overlay}
      containerStyle={{
        margin: 16,
        paddingVertical: 16,
        backgroundColor: Colors.surface,
        borderRadius: 4,
      }}
    >
      <StatusBar
        style={Platform.OS === 'ios' ? 'light' : 'auto'}
        backgroundColor={Colors.overlay}
      />
      <Text style={styles.titleDialog}>{label}</Text>

      <Input
        outerContainerStyle={{ paddingHorizontal: 16 }}
        label={label}
        inputType={inputType}
        initialValue={initialValue}
        onChangeText={(text) => (value.current = text)}
      />

      <View
        style={{
          display: 'flex',
          flexDirection: 'row',
          marginLeft: 'auto',
        }}
      >
        <Ripple
          rippleColor={Colors.onBackground}
          rippleContainerBorderRadius={100}
          rippleCentered
          onPress={() => setTimeout(onDismiss, 100)}
          style={{
            paddingVertical: 8,
            paddingHorizontal: 16,
            marginRight: 8,
          }}
        >
          <Text
            style={{
              ...Typography.LabelLarge,
              color: Colors.primary,
            }}
          >
            {t('utils:cancel')}
          </Text>
        </Ripple>
        <Ripple
          rippleColor={Colors.onBackground}
          rippleContainerBorderRadius={100}
          rippleCentered
          onPress={() =>
            setTimeout(() => {
              onFinish?.(value.current ?? '')
              value.current = ''
              onDismiss()
            }, 100)
          }
          style={{
            paddingVertical: 8,
            paddingHorizontal: 16,
          }}
        >
          <Text
            style={{
              ...Typography.LabelLarge,
              color: Colors.primary,
            }}
          >
            {t('utils:save')}
          </Text>
        </Ripple>
      </View>
    </Dialog>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  chipActive: {
    marginRight: 8,
    borderColor: Colors.secondaryContainer,
    backgroundColor: Colors.secondaryContainer,
    color: Colors.onSecondaryContainer,
  },
  chipInactive: {
    marginRight: 8,
    borderColor: Colors.outline,
    color: Colors.onSurface,
  },
  sectionTitle: {
    ...Typography.LabelSmall,
    textAlignVertical: 'center',
    marginHorizontal: 16,
    marginVertical: 8,
  },
  titleDialog: {
    ...Typography.TitleSmall,
    marginBottom: 8,
    paddingHorizontal: 16,
  },
  button: {
    marginHorizontal: 16,
    marginVertical: 8,
  },
})
