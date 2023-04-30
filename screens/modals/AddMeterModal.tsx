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
import { HomeStackScreenProps } from '../../types'

export default function AddMeterModal({ navigation }: HomeStackScreenProps<'AddMeterModal'>) {
  const [repository] = useRepository<Meter, MeterService>(MeterService)
  const [contracts, _, contractRepo] = useUpdatedData<Contract, ContractService>(ContractService)

  const [loading, setLoading] = useState(false)
  const [selectedContract, setSelectedContract] = useState<number | undefined>(undefined)

  const name = useRef('')
  const identificationNumber = useRef('')
  const digits = useRef('')
  const unit = useRef('')

  const textFieldRefs = useRef({
    name: undefined,
    identificationNumber: undefined,
    digits: undefined,
    unit: undefined,
  } as Record<string, any>)

  const [formBoolState, setFormBoolState] = useState({
    valuesAreIncreasing: true,
    isActive: true,
  })

  const onSave = useCallback(async () => {
    const validations = Object.values(textFieldRefs.current)
    validations.forEach((validation: any) => validation.validate())
    if (validations.some((validation: any) => !validation.isValid())) {
      return
    }

    setLoading(true)

    const meter = new Meter(
      name.current, parseInt(digits.current), unit.current, selectedContract, formBoolState.valuesAreIncreasing,
      formBoolState.isActive, identificationNumber.current,
    )
    await repository.insertData(meter)

    setLoading(false)
    navigation.pop()
  }, [formBoolState])

  return (
    <SafeAreaView style={{display: "flex", flexDirection: "column", height: "100%"}}>
      <AppBar
        loading={ loading }
        title={ t('home_screen:add_new_meter') }
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
        </View>

        <View
          style={ {
            paddingHorizontal: 16,
            marginTop: 16,
            marginBottom: 8,
          } }
        >
          <Text
            style={ {
              ...Typography.LabelSmall,
              marginBottom: 4,
            } }
          >
            Configuration
          </Text>
          <View
            row
            marginB-16
          >
            <Input
              ref={ (ref: any) => textFieldRefs.current.digits = ref }
              label={ t('meter:input_placeholder_digit') }
              outerContainerStyle={ {
                marginRight: 8,
                flex: 2,
              } }
              onChangeText={ (value) => digits.current = value }
              validation={ ['required', (value: string) => !isNaN(Number(value))] }
              inputType='numeric'
              validationMessages={ [t('validationMessage:required'), t('validationMessage:isNotANumber')] }
              onSubmit={ onSave }
            />
            <Input
              ref={ (ref: any) => textFieldRefs.current.unit = ref }
              label={ t('meter:input_placeholder_unit') }
              outerContainerStyle={ { flex: 3 } }
              onChangeText={ (value) => unit.current = value }
              validation={ ['required'] }
              validationMessages={ [t('validationMessage:required')] }
              onSubmit={ onSave }
            />
          </View>

          <View style={ { marginBottom: 8 } }>
            <Checkbox
              label={ t('meter:input_placeholder_is_increase') }
              color={ Colors.primary }
              value={ formBoolState.valuesAreIncreasing }
              onValueChange={ (valuesAreIncreasing: boolean) => setFormBoolState({
                ...formBoolState,
                valuesAreIncreasing,
              }) }
            />
          </View>
          <Checkbox
            label={ t('meter:input_placeholder_is_valid') }
            color={ Colors.primary }
            value={ formBoolState.isActive }
            onValueChange={ (isActive: boolean) => setFormBoolState({
              ...formBoolState,
              isActive,
            }) }
          />
        </View>

        <View
          style={ {
            paddingHorizontal: 16,
            marginTop: 8,
          } }
        >
          <Text
            style={ {
              ...Typography.LabelSmall,
              marginTop: 16,
              marginBottom: 8,
            } }
          >
            Contract
          </Text>
          {
            contracts.map(contract => <ContractSelectEntry
              key={ contract.id }
              contract={ contract }
              selectedContract={ selectedContract }
              setSelectedContract={ setSelectedContract }
            />)
          }

          <Button
            label={ t('home_screen:add_new_contract') }
            icon={ AddIcon }
            onPress={ () => navigation.navigate("AddContractModal") }
          />
        </View>
      </ScrollView>


      {/* Use a light status bar on iOS to account for the black space above the modal */ }
      <StatusBar style={ Platform.OS === 'ios' ? 'light' : 'auto' } />
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({})
