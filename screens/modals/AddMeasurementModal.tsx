import { StatusBar } from 'expo-status-bar'
import moment from 'moment'
import * as React from 'react'
import { useCallback, useEffect, useRef, useState } from 'react'
import { Platform, StyleSheet } from 'react-native'
import { ScrollView } from 'react-native-gesture-handler'
import Ripple from 'react-native-material-ripple'
import { SafeAreaView } from 'react-native-safe-area-context'
import Torch from 'react-native-torch'

import { Colors, Text, View } from 'react-native-ui-lib'
import { AppBar } from '../../components/AppBar'
import { Button } from '../../components/Button'
import { DateInput } from '../../components/DateInput'
import { FloatingActionButton } from '../../components/FloatingActionButton'
import { IconButton } from '../../components/IconButton'
import { AddIcon } from '../../components/icons/AddIcon'
import { CloseIcon } from '../../components/icons/CloseIcon'
import { FlashIcon } from '../../components/icons/FlashIcon'
import { FlashOffIcon } from '../../components/icons/FlashOffIcon'
import { Input } from '../../components/Input'
import { MeterSelectEntry } from '../../components/meters/MeterSelectEntry'
import { HomeStackScreenProps } from '../../navigation/types'
import Measurement from '../../services/database/entities/measurement'
import Meter from '../../services/database/entities/meter'
import { useRepository, useUpdatedData } from '../../services/database/GenericRepository'
import MeasurementService from '../../services/database/services/MeasurementService'
import MeterService from '../../services/database/services/MeterService'
import { t } from '../../services/i18n'
import { Typography } from '../../setupTheme'
import { parseValueForDigits } from '../../utils/TranslationUtils'

export default function AddMeasurementModal({
                                              navigation,
                                              route: {
                                                params: {
                                                  meter,
                                                  editMeasurement,
                                                  onEndEditing,
                                                },
                                              },
                                            }: HomeStackScreenProps<'AddMeasurementModal'>) {
  const [repository, service] = useRepository<Measurement, MeasurementService>(MeasurementService)
  const [meters] = useUpdatedData<Meter, MeterService>(MeterService)

  const [isFlashOn, setIsFlashOn] = useState(false)

  const [loading, setLoading] = useState(false)
  const [selectedMeter, setSelectedMeter] = useState<Meter | undefined>(meter)
  const [lastMeasurement, setLastMeasurement] = useState<Measurement | undefined>(undefined)

  useEffect(() => {
    if (!selectedMeter) {
      setLastMeasurement(undefined)
      return
    }

    const query = editMeasurement
                  ? service.getPreviousMeasurement(editMeasurement)
                  : service.getLastMeasurementForMeter(selectedMeter.id!)
    repository.executeRaw<[Measurement]>(query)
      .then((result) => {
          if (!result?.[0]) {
            setLastMeasurement(undefined)
          } else {
            setLastMeasurement(service.fromJSON(result[0]))
          }
        },
      )
  }, [selectedMeter, repository, service])

  const value = useRef<string>(editMeasurement?.value?.toString() ?? '')
  const date = useRef(editMeasurement?.createdAt ? new Date(editMeasurement?.createdAt) : new Date())

  const textFieldRefs = useRef({
    value: undefined,
    date: undefined,
  } as Record<string, any>)

  const [errorState, setErrorState] = useState({
    meter: '',
    value: '',
    date: '',
  })

  const switchTorch = useCallback(async (newFlashState: boolean) => {
    setIsFlashOn(newFlashState)
    if (Platform.OS === 'ios') {
      Torch.switchState(newFlashState)
      return
    }

    const cameraAllowed = await Torch.requestCameraPermission(
        t('utils:camera_permission'), // dialog title
        t('utils:camera_permission_message'), // dialog body
      )
      .catch(err => console.log('ERROR WITH CAMERA PERMISSION', err))

    if (!cameraAllowed) {
      return
    }

    try {
      // noinspection JSVoidFunctionReturnValueUsed
      Promise.resolve(Torch.switchState(newFlashState))
        .catch(err => console.log('ERROR WITH TORCH', err))
    } catch (e) {
      console.log('ERROR WITH TORCH', e)
    }
  }, [])

  // Switch off torch when the modal is popped
  useEffect(() => {
    return () => {
      // Do not want to ask for camera permission when the flash was not used
      if(!isFlashOn) return
      switchTorch(false)
    }
  }, [switchTorch, isFlashOn])

  const onSave = useCallback(async () => {
    const validations = Object.values(textFieldRefs.current)
    validations?.forEach((validation: any) => validation.validate())
    if (validations?.some((validation: any) => !validation.isValid())) {
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

    const floatValue = parseFloat(value.current.replace(',', '.'))
    const measurement = new Measurement(floatValue, selectedMeter.id!, date.current.getTime())

    if (!editMeasurement) {
      await repository.insertData(measurement)
    } else {
      measurement.id = editMeasurement.id
      await repository.updateData(measurement)
      onEndEditing?.()
    }

    // switchTorch(false)
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
        title={ t('home_screen:add_new_reading') }
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
              { t('utils:save') }
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
            label={ t('meter:reading') }
            onChangeText={ (textValue) => value.current = textValue }
            validation={ ['required', (value: string) => !isNaN(parseFloat(value.replace(',', '.')))] }
            validationMessages={ [t('validationMessage:required'), t('validationMessage:isNotANumber')] }
            onSubmit={ onSave }
            initialValue={ value.current }
            hint={ lastMeasurement
                   ? t('meter:last_reading_value', {
                value: parseValueForDigits(lastMeasurement.value, selectedMeter?.digits),
                unit: selectedMeter?.unit,
              })
                   : t('meter:no_previous_reading') }
          />
          <DateInput
            ref={ (ref: any) => textFieldRefs.current.date = ref }
            label={ t('utils:date') }
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
          } }
        >
          <Text
            style={ {
              ...Typography.LabelSmall,
              marginTop: 16,
              marginBottom: 8,
            } }
          >
            { t('meter:meter') }
          </Text>
          {
            errorState.meter && <Text
                  style={ {
                    ...Typography.BodySmall,
                    color: Colors.error,
                  } }
              >
              { errorState.meter }
              </Text>
          }
          {
            meters.map(meter => <MeterSelectEntry
              key={ meter.id }
              meter={ meter }
              selectedMeter={ selectedMeter }
              setSelectedMeter={ setSelectedMeter }
            />)
          }

          <Button
            label={ t('home_screen:add_new_meter') }
            icon={ AddIcon }
            onPress={ () => navigation.navigate('AddMeterModal', {}) }
          />
        </View>
      </ScrollView>


      <FloatingActionButton
        icon={ isFlashOn ? FlashOffIcon : FlashIcon }
        onPress={ () => switchTorch(!isFlashOn) }
      />

      {/* Use a light status bar on iOS to account for the black space above the modal */ }
      <StatusBar style={ Platform.OS === 'ios' ? 'light' : 'auto' } />
    </SafeAreaView>
  )
}
