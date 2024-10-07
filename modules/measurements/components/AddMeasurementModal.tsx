import EventEmitter from '@/events'
import { createNewMeasurement, updateMeasurement } from '@/measurements/measurements.persistor'
import { EVENT_INVALIDATE_MEASUREMENTS } from '@/measurements/measurements.constants'
import { MeterSelectEntry } from '@/meters/components'
import { type DetailedMeterWithLastValue } from '@/meters/meters.selector'
import { detailedMeters } from '@/meters/meters.signals'
import { useSignal } from '@preact/signals-react'
import { Truthy } from '@utils/CommonUtils'
import { StatusBar } from 'expo-status-bar'
import * as React from 'react'
import { useCallback, useEffect, useRef, useState } from 'react'
import { Platform } from 'react-native'
import { ScrollView } from 'react-native-gesture-handler'
import Ripple from 'react-native-material-ripple'
import { SafeAreaView } from 'react-native-safe-area-context'
import Torch from 'react-native-torch'

import { Colors, Text, View } from 'react-native-ui-lib'
import { AppBar } from '../../../components/AppBar'
import { Button } from '../../../components/Button'
import { DateInput } from '../../../components/DateInput'
import { FloatingActionButton } from '../../../components/FloatingActionButton'
import { IconButton } from '../../../components/IconButton'
import { AddIcon } from '../../../components/icons/AddIcon'
import { CloseIcon } from '../../../components/icons/CloseIcon'
import { FlashIcon } from '../../../components/icons/FlashIcon'
import { FlashOffIcon } from '../../../components/icons/FlashOffIcon'
import { Input, type InputRef } from '../../../components/Input'
import { type HomeStackScreenProps } from '../../../navigation/types'
import { t } from '@/i18n'
import { Typography } from '../../../setupTheme'
import { parseValueForDigits } from '@utils/TranslationUtils'

export default function AddMeasurementModal({
  navigation,
  route: {
    params: { meter, editMeasurement },
  },
}: HomeStackScreenProps<'AddMeasurementModal'>) {
  const [isFlashOn, setIsFlashOn] = useState(false)

  const [loading, setLoading] = useState(false)
  const selectedMeter = useSignal<DetailedMeterWithLastValue | undefined>(meter)

  const value = useRef<string>(editMeasurement?.value?.toString() ?? '')
  const date = useRef(
    editMeasurement?.createdAt ? new Date(editMeasurement?.createdAt) : new Date()
  )

  const textFieldRefs = useRef({
    value: null,
    date: null,
  } as Record<string, InputRef | null>)

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
      t('utils:camera_permission_message') // dialog body
    ).catch((err) => console.log('ERROR WITH CAMERA PERMISSION', err))

    if (!cameraAllowed) {
      return
    }

    try {
      // noinspection JSVoidFunctionReturnValueUsed
      Promise.resolve(Torch.switchState(newFlashState)).catch((err) =>
        console.log('ERROR WITH TORCH', err)
      )
    } catch (e) {
      console.log('ERROR WITH TORCH', e)
    }
  }, [])

  // Switch off torch when the modal is popped
  useEffect(() => {
    return () => {
      // Do not want to ask for camera permission when the flash was not used
      if (!isFlashOn) return
      switchTorch(false)
    }
  }, [switchTorch, isFlashOn])

  const onSave = useCallback(async () => {
    const validations = Object.values(textFieldRefs.current).filter(Truthy)
    validations?.forEach((validation) => validation.validate())
    if (validations?.some((validation) => !validation.isValid())) {
      return
    }

    const selectedMeterId = selectedMeter.peek()?.id
    if (!selectedMeterId) {
      setErrorState({
        ...errorState,
        meter: t('validationMessage:required'),
      })
      return
    }

    setLoading(true)

    const floatValue = parseFloat(value.current.replace(',', '.'))
    if (!editMeasurement) {
      await createNewMeasurement(selectedMeterId, floatValue, date.current.getTime())
    } else {
      await updateMeasurement(
        editMeasurement.id,
        selectedMeterId,
        floatValue,
        date.current.getTime()
      )
    }

    switchTorch(false)
    setLoading(false)
    EventEmitter.emit(EVENT_INVALIDATE_MEASUREMENTS)
    navigation.pop()
  }, [editMeasurement, errorState, navigation, selectedMeter, switchTorch])

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
        title={t('home_screen:add_new_reading')}
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
            ref={(ref) => (textFieldRefs.current.value = ref)}
            textFieldProps={{ autoFocus: true }}
            inputType="numeric"
            label={t('meter:reading')}
            onChangeText={(textValue) => (value.current = textValue)}
            validation={[
              'required',
              (value: string) => !isNaN(parseFloat(value.replace(',', '.'))),
            ]}
            validationMessages={[
              t('validationMessage:required'),
              t('validationMessage:isNotANumber'),
            ]}
            onSubmit={onSave}
            initialValue={value.current}
            hint={
              selectedMeter.value?.lastMeasurementValue
                ? t('meter:last_reading_value', {
                    value: parseValueForDigits(
                      selectedMeter.value.lastMeasurementValue,
                      selectedMeter.value?.digits
                    ),
                    unit: selectedMeter.value?.unit,
                  })
                : t('meter:no_previous_reading')
            }
          />
          <DateInput
            ref={(ref) => (textFieldRefs.current.date = ref)}
            label={t('utils:date')}
            onChange={(dateValue) => (date.current = dateValue)}
            validation={['required']}
            validationMessages={[t('validationMessage:required')]}
            onSubmit={onSave}
            value={date.current}
          />
        </View>

        <View
          style={{
            paddingHorizontal: 16,
          }}
        >
          <>
            <Text
              style={{
                ...Typography.LabelSmall,
                marginTop: 16,
                marginBottom: 8,
              }}
            >
              {t('meter:meter')}
            </Text>
            {errorState.meter && (
              <Text
                style={{
                  ...Typography.BodySmall,
                  color: Colors.error,
                }}
              >
                {errorState.meter}
              </Text>
            )}
            {detailedMeters.value.map((meter) => (
              <MeterSelectEntry key={meter.id} meter={meter} selectedMeter={selectedMeter} />
            ))}

            <Button
              label={t('home_screen:add_new_meter')}
              icon={AddIcon}
              onPress={() => navigation.navigate('AddMeterModal', {})}
            />
          </>
        </View>
      </ScrollView>

      <FloatingActionButton
        icon={isFlashOn ? FlashOffIcon : FlashIcon}
        onPress={() => switchTorch(!isFlashOn)}
      />

      {/* Use a light status bar on iOS to account for the black space above the modal */}
      <StatusBar style={Platform.OS === 'ios' ? 'light' : 'auto'} />
    </SafeAreaView>
  )
}
