import { EVENT_INVALIDATE_CONTRACTS } from '@/contracts/contracts.constants'
import {
  createNewContract,
  deleteContract,
  insertContract,
  updateContract,
} from '@/contracts/contracts.persistor'
import { type DetailedContract } from '@/contracts/contracts.selector'
import { Truthy } from '@utils/CommonUtils'
import { StatusBar } from 'expo-status-bar'
import * as React from 'react'
import { useCallback, useRef, useState } from 'react'
import { Platform } from 'react-native'
import { ScrollView } from 'react-native-gesture-handler'
import Ripple from 'react-native-material-ripple'
import { SafeAreaView } from 'react-native-safe-area-context'

import { Colors, Text, View } from 'react-native-ui-lib'
import { AppBar } from '../../../components/AppBar'
import { Button } from '../../../components/Button'
import { IconButton } from '../../../components/IconButton'
import { CheckCircleIcon } from '../../../components/icons/CheckCircleIcon'
import { CloseIcon } from '../../../components/icons/CloseIcon'
import { Input, type InputRef } from '../../../components/Input'
import { type HomeStackScreenProps } from '../../../navigation/types'
import EventEmitter from '@/events'
import { t } from '@/i18n'
import { Typography } from '../../../setupTheme'

export default function AddContractModal({
  navigation,
  route: {
    params: { editContract, onEndEditing },
  },
}: HomeStackScreenProps<'AddContractModal'>) {
  const [loading, setLoading] = useState(false)

  const name = useRef(editContract?.name ?? '')
  const identificationNumber = useRef(editContract?.identification ?? '')
  const pricePerUnit = useRef(editContract?.pricePerUnit.toString() ?? '')
  const conversion = useRef(editContract?.conversion.toString() ?? '1')

  const textFieldRefs = useRef({
    name: null,
    identificationNumber: null,
    pricePerUnit: null,
    conversion: null,
  } as Record<string, InputRef | null>)

  const onSave = useCallback(async () => {
    const validations = Object.values(textFieldRefs.current).filter(Truthy)
    validations.forEach((validation) => validation.validate())
    if (validations.some((validation) => !validation.isValid())) {
      return
    }

    setLoading(true)

    let createdContract: DetailedContract | undefined
    if (!editContract) {
      createdContract = await createNewContract(
        name.current,
        parseFloat(pricePerUnit.current),
        identificationNumber.current,
        parseFloat(conversion.current),
        true
      )
    } else {
      createdContract = await updateContract(
        editContract.id,
        name.current,
        parseFloat(pricePerUnit.current),
        identificationNumber.current,
        parseFloat(conversion.current),
        true
      )
    }

    EventEmitter.emit(EVENT_INVALIDATE_CONTRACTS)
    if (onEndEditing && createdContract) {
      onEndEditing(createdContract)
    }
    setLoading(false)
    navigation.pop()
  }, [editContract, navigation])

  return (
    <SafeAreaView
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
      }}
    >
      <AppBar
        loading={loading}
        title={t('home_screen:add_new_contract')}
        leftAction={
          <>
            <IconButton
              style={{ marginRight: 8 }}
              getIcon={() => <CloseIcon color={Colors.onBackground} />}
              onPress={() => navigation.pop()}
            />
          </>
        }
        actions={
          <>
            <Ripple
              rippleColor={Colors.onBackground}
              rippleContainerBorderRadius={100}
              rippleCentered
              onPress={onSave}
              style={{ padding: 8 }}
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
          </>
        }
      />

      <ScrollView
        style={{
          flex: 1,
          marginBottom: 16,
        }}
      >
        <View style={{ paddingHorizontal: 16 }}>
          <Input
            ref={(ref) => (textFieldRefs.current.name = ref)}
            label={t('meter:input_placeholder_name')}
            onChangeText={(value) => (name.current = value)}
            validation={['required']}
            validationMessages={[t('validationMessage:required')]}
            onSubmit={onSave}
            initialValue={name.current}
          />
          <Input
            ref={(ref) => (textFieldRefs.current.identificationNumber = ref)}
            label={t('meter:input_placeholder_identification')}
            onChangeText={(value) => (identificationNumber.current = value)}
            onSubmit={onSave}
            initialValue={identificationNumber.current}
          />
          <Input
            ref={(ref) => (textFieldRefs.current.pricePerUnit = ref)}
            label={t('contract:input_placeholder_price_per_unit')}
            inputType="numeric"
            onChangeText={(value) => (pricePerUnit.current = value)}
            validation={[
              'required',
              (value: string) => !isNaN(parseFloat(value.replace(',', '.'))),
            ]}
            validationMessages={[
              t('validationMessage:required'),
              t('validationMessage:isNotANumber'),
            ]}
            onSubmit={onSave}
            hint={t('contract:in_cents')}
            initialValue={pricePerUnit.current}
          />
          <Input
            ref={(ref) => (textFieldRefs.current.conversion = ref)}
            label={t('contract:input_placeholder_conversion')}
            inputType="numeric"
            onChangeText={(value) => (conversion.current = value)}
            validation={[
              'required',
              (value: string) => !isNaN(parseFloat(value.replace(',', '.'))),
            ]}
            validationMessages={[
              t('validationMessage:required'),
              t('validationMessage:isNotANumber'),
            ]}
            onSubmit={onSave}
            hint={t('contract:explain_conversion')}
            initialValue={conversion.current}
          />
        </View>

        {!!editContract?.id && (
          <View style={{ paddingHorizontal: 16 }}>
            <Button
              label={t('contract:delete_contract')}
              color="error"
              onPress={async () => {
                await deleteContract(editContract.id)
                EventEmitter.emit(EVENT_INVALIDATE_CONTRACTS)

                let didUndo = false
                EventEmitter.emitToast({
                  message: t('utils:deleted_contract'),
                  icon: CheckCircleIcon,
                  action: {
                    label: t('utils:undo'),
                    onPress: () => {
                      if (didUndo) {
                        return
                      }

                      didUndo = true
                      EventEmitter.emitToast(undefined)
                      insertContract(
                        editContract.id,
                        editContract.name,
                        editContract.pricePerUnit,
                        editContract.identification ?? null,
                        editContract.conversion,
                        editContract?.createdAt ?? Date.now()
                      ).then(() => {
                        EventEmitter.emit(EVENT_INVALIDATE_CONTRACTS)
                      })
                    },
                  },
                })

                navigation.pop()
              }}
            />
          </View>
        )}
      </ScrollView>

      {/* Use a light status bar on iOS to account for the black space above the modal */}
      <StatusBar style={Platform.OS === 'ios' ? 'light' : 'auto'} />
    </SafeAreaView>
  )
}
