import { StatusBar } from 'expo-status-bar'
import * as React from 'react'
import { useCallback, useRef, useState } from 'react'
import { Platform, StyleSheet } from 'react-native'
import { ScrollView } from 'react-native-gesture-handler'
import Ripple from 'react-native-material-ripple'
import { SafeAreaView } from 'react-native-safe-area-context'

import { Checkbox, Colors, Text, View } from 'react-native-ui-lib'
import { AppBar } from '../../components/AppBar'
import { Button } from '../../components/Button'
import { ContractSelectEntry } from '../../components/contracts/ContractSelectEntry'
import { IconButton } from '../../components/IconButton'
import { AddIcon } from '../../components/icons/AddIcon'
import { CloseIcon } from '../../components/icons/CloseIcon'
import { Input } from '../../components/Input'
import { Typography } from '../../constants/Theme'
import Contract from '../../services/database/entities/contract'
import Meter from '../../services/database/entities/meter'
import { useRepository, useUpdatedData } from '../../services/database/GenericRepository'
import ContractService from '../../services/database/services/ContractService'
import MeterService from '../../services/database/services/MeterService'
import { t } from '../../services/i18n'
import { HomeStackScreenProps } from '../../navigation/types'

export default function AddContractModal({ navigation }: HomeStackScreenProps<'AddContractModal'>) {
  const [repository] = useRepository<Contract, ContractService>(ContractService)

  const [loading, setLoading] = useState(false)

  const name = useRef('')
  const identificationNumber = useRef('')
  const pricePerUnit = useRef('')

  const textFieldRefs = useRef({
    name: undefined,
    identificationNumber: undefined,
    pricePerUnit: undefined,
  } as Record<string, any>)

  const onSave = useCallback(async () => {
    const validations = Object.values(textFieldRefs.current)
    validations.forEach((validation: any) => validation.validate())
    if (validations.some((validation: any) => !validation.isValid())) {
      return
    }

    setLoading(true)

    const contract = new Contract(name.current, parseFloat(pricePerUnit.current), identificationNumber.current)
    await repository.insertData(contract)

    setLoading(false)
    navigation.pop()
  }, [])

  return (
    <SafeAreaView style={{display: "flex", flexDirection: "column", height: "100%"}}>
      <AppBar
        loading={ loading }
        title={ t('home_screen:add_new_contract') }
        leftAction={ <>
          <IconButton
            style={ { marginRight: 8 } }
            getIcon={ () => <CloseIcon color={ Colors.onBackground } /> }
            onPress={ () => navigation.pop() }
          />
        </> }
        actions={ <>
          <Ripple
            rippleColor={ Colors.onBackground }
            rippleContainerBorderRadius={ 100 }
            rippleCentered
            onPress={ onSave }
            style={ { padding: 8 } }
          >
            <Text
              style={ {
                ...Typography.LabelLarge,
                color: Colors.primary,
              } }
            >
              Save
            </Text>
          </Ripple>
        </> }
      />

      <ScrollView style={{flex: 1, marginBottom: 16}}>
        <View style={ { paddingHorizontal: 16 } }>
          <Input
            ref={ (ref: any) => textFieldRefs.current.name = ref }
            label={ t('meter:input_placeholder_name') }
            onChangeText={ (value) => name.current = value }
            validation={ ['required'] }
            validationMessages={ [t('validationMessage:required')] }
            onSubmit={ onSave }
          />
          <Input
            ref={ (ref: any) => textFieldRefs.current.identificationNumber = ref }
            label={ t('meter:input_placeholder_identification') }
            onChangeText={ (value) => identificationNumber.current = value }
            onSubmit={ onSave }
          />
          <Input
            ref={ (ref: any) => textFieldRefs.current.pricePerUnit = ref }
            label={ t('contract:input_placeholder_price_per_unit') }
            onChangeText={ (value) => pricePerUnit.current = value }
            validation={ ['required'] }
            validationMessages={ [t('validationMessage:required')] }
            onSubmit={ onSave }
            hint='in cents'
          />
        </View>

      </ScrollView>


      {/* Use a light status bar on iOS to account for the black space above the modal */ }
      <StatusBar style={ Platform.OS === 'ios' ? 'light' : 'auto' } />
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({})
