import { StatusBar } from 'expo-status-bar'
import * as React from 'react'
import { useCallback, useEffect, useRef, useState } from 'react'
import { Platform, StyleSheet } from 'react-native'
import { ScrollView } from 'react-native-gesture-handler'
import Ripple from 'react-native-material-ripple'
import { SafeAreaView } from 'react-native-safe-area-context'

import { Colors, Text, View } from 'react-native-ui-lib'
import { AppBar } from '../../components/AppBar'
import { Button } from '../../components/Button'
import { MeterSelectEntry } from '../../components/contracts/MeterSelectEntry'
import { DateInput } from '../../components/DateInput'
import { IconButton } from '../../components/IconButton'
import { AddIcon } from '../../components/icons/AddIcon'
import { CloseIcon } from '../../components/icons/CloseIcon'
import { Input } from '../../components/Input'
import { Typography } from '../../constants/Theme'
import Measurement from '../../services/database/entities/measurement'
import Meter from '../../services/database/entities/meter'
import { useRepository, useUpdatedData } from '../../services/database/GenericRepository'
import MeasurementService from '../../services/database/services/MeasurementService'
import MeterService from '../../services/database/services/MeterService'
import { t } from '../../services/i18n'
import { HomeStackScreenProps } from '../../types'

export default function AddMeasurementModal({
                                              navigation,
                                              route,
                                            }: HomeStackScreenProps<'AddMeasurementModal'>) {
  const [repository, service] = useRepository<Measurement, MeasurementService>(MeasurementService)
  const [meters, , meterRepo] = useUpdatedData<Meter, MeterService>(MeterService)

  const [loading, setLoading] = useState(false)
  const [selectedMeter, setSelectedMeter] = useState(route.params.meter?.id)
  const [lastMeasurement, setLastMeasurement] = useState<Measurement | undefined>(undefined)

  useEffect(() => {
    if (!selectedMeter) {
      setLastMeasurement(undefined)
      return
    }

    repository.executeRaw<[Measurement]>(service.getLastMeasurementForMeter(selectedMeter))
      .then((result) => setLastMeasurement(result?.[0]))
  }, [selectedMeter, repository, service])

  const value = useRef<string>('')
  const date = useRef(new Date())

  const textFieldRefs = useRef({
    value: undefined,
    date: undefined,
  } as Record<string, any>)

  const [errorState, setErrorState] = useState({
    meter: '',
    value: '',
    date: '',
  })

  const onSave = useCallback(async () => {
    const validations = Object.values(textFieldRefs.current)
    validations?.forEach((validation: any) => validation.validate())
    if (validations?.some((validation: any) => !validation.isValid())) {
      return
    }

    const floatValue = parseFloat(value.current)
    if (isNaN(floatValue)) {
      setErrorState({
        ...errorState,
        value: 'Value must be a number',
      })
      return
    }
    if (!selectedMeter) {
      setErrorState({
        ...errorState,
        meter: t('validationMessage:required'),
      })
      return
    }

    setLoading(true)

    const measurement = new Measurement(floatValue, selectedMeter, date.current.getTime())
    await repository.insertData(measurement)

    setLoading(false)
    navigation.pop()
  }, [selectedMeter])

  return (
    <SafeAreaView
      style={ {
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
      } }
    >
      <AppBar
        loading={ loading }
        title={ 'Add Measurement' }
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

      <ScrollView
        style={ {
          flex: 1,
          marginBottom: 16,
        } }
      >
        <View style={ { paddingHorizontal: 16 } }>
          <Input
            ref={ (ref: any) => textFieldRefs.current.value = ref }
            textFieldProps={ { autoFocus: true } }
            inputType='numeric'
            label={ 'Value' }
            onChangeText={ (textValue) => value.current = textValue }
            validation={ ['required'] }
            validationMessages={ [t('validationMessage:required')] }
            onSubmit={ onSave }
            hint={ lastMeasurement ? `Last value was: ${ lastMeasurement.value }` : 'No previous measurement found' }
          />
          <DateInput
            ref={ (ref: any) => textFieldRefs.current.date = ref }
            label={ 'Date' }
            onChange={ (dateValue) => date.current = dateValue }
            validation={ ['required'] }
            validationMessages={ [t('validationMessage:required')] }
            onSubmit={ onSave }
            value={ date.current }
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
            Meter
          </Text>
          {errorState.meter && <Text style={{...Typography.BodySmall, color: Colors.error}}>{errorState.meter}</Text>}
          {
            meters.map(meter => <MeterSelectEntry
              key={ meter.id }
              meter={ meter }
              selectedMeter={ selectedMeter }
              setSelectedMeter={ setSelectedMeter }
            />)
          }

          <Button
            label={ 'Add Meter' }
            icon={ AddIcon }
            onPress={ () => navigation.push('AddMeterModal') }
          />
        </View>
      </ScrollView>

      {/* Use a light status bar on iOS to account for the black space above the modal */ }
      <StatusBar style={ Platform.OS === 'ios' ? 'light' : 'auto' } />
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({})
