import { DEFAULT_BUILDING_ID } from '@/buildings/buildings.constants'
import {
  detailedBuildings,
  selectedBuilding as selectedBuildingSignal,
} from '@/buildings/buildings.signals'
import { BuildingSelectEntry } from '@/buildings/components'
import { ContractSelectEntry } from '@/contracts/components'
import { allContracts } from '@/contracts/contracts.signals'
import EventEmitter from '@/events'
import { EVENT_INVALIDATE_METERS } from '@/meters/meters.constants'
import { createNewMeter, updateMeter } from '@/meters/meters.persistor'
import { settings } from '@/settings'
import { useSignal } from '@preact/signals-react'
import { StatusBar } from 'expo-status-bar'
import * as React from 'react'
import { useCallback, useRef, useState } from 'react'
import { Platform } from 'react-native'
import { ScrollView } from 'react-native-gesture-handler'
import Ripple from 'react-native-material-ripple'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Checkbox, Colors, Text, View } from 'react-native-ui-lib'
import { AppBar } from '../../../components/AppBar'
import { Button } from '../../../components/Button'
import { IconButton } from '../../../components/IconButton'
import { AddIcon } from '../../../components/icons/AddIcon'
import { CloseIcon } from '../../../components/icons/CloseIcon'
import { Input, type InputRef } from '../../../components/Input'
import { type HomeStackScreenProps } from '../../../navigation/types'
import { t } from '@/i18n'
import { Typography } from '../../../setupTheme'
import { Truthy } from '@utils/CommonUtils'

export default function AddMeterModal({
  navigation,
  route: {
    params: { editMeter },
  },
}: HomeStackScreenProps<'AddMeterModal'>) {
  const [loading, setLoading] = useState(false)
  const selectedContract = useSignal(editMeter?.contract_id ?? null)
  const [selectedBuilding, setSelectedBuilding] = useState(
    editMeter?.building_id ?? selectedBuildingSignal.peek()
  )

  const name = useRef(editMeter?.name ?? '')
  const identificationNumber = useRef(editMeter?.identification ?? '')
  const digits = useRef(editMeter?.digits.toString() ?? '')
  const unit = useRef(editMeter?.unit ?? '')

  const textFieldRefs = useRef({
    name: null,
    identificationNumber: null,
    digits: null,
    unit: null,
  } as Record<string, InputRef | null>)

  const [formBoolState, setFormBoolState] = useState({
    areValuesDepleting: editMeter?.areValuesDepleting ?? false,
    isRefillable: editMeter?.isRefillable ?? false,
    isActive: editMeter?.isActive ?? true,
  })

  const onSave = useCallback(async () => {
    const validations = Object.values(textFieldRefs.current)
    validations.filter(Truthy).forEach((validation) => validation.validate())
    if (validations.filter(Truthy).some((validation) => !validation.isValid())) {
      return
    }

    setLoading(true)

    if (!editMeter) {
      await createNewMeter(
        name.current,
        parseInt(digits.current),
        unit.current,
        selectedContract.peek(),
        formBoolState.areValuesDepleting,
        formBoolState.isActive,
        identificationNumber.current,
        0,
        formBoolState.isRefillable,
        selectedBuilding
      )
    } else {
      await updateMeter(
        editMeter.id,
        name.current,
        parseInt(digits.current),
        unit.current,
        selectedContract.peek(),
        formBoolState.areValuesDepleting,
        formBoolState.isActive,
        identificationNumber.current,
        editMeter.createdAt ?? Date.now(),
        editMeter.sortingOrder ?? 0,
        formBoolState.isRefillable,
        selectedBuilding
      )
    }

    setLoading(false)
    EventEmitter.emit(EVENT_INVALIDATE_METERS)
    navigation.pop()
  }, [
    selectedContract,
    selectedBuilding,
    formBoolState.areValuesDepleting,
    formBoolState.isRefillable,
    formBoolState.isActive,
    editMeter,
    navigation,
  ])

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
        title={t('home_screen:add_new_meter')}
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
        </View>

        <View
          style={{
            paddingHorizontal: 16,
          }}
        >
          <View row>
            <Input
              ref={(ref) => (textFieldRefs.current.digits = ref)}
              label={t('meter:input_placeholder_digit')}
              outerContainerStyle={{
                marginRight: 8,
                flex: 2,
              }}
              onChangeText={(value) => (digits.current = value)}
              validation={['required', (value: string) => !isNaN(Number(value))]}
              inputType="numeric"
              validationMessages={[
                t('validationMessage:required'),
                t('validationMessage:isNotANumber'),
              ]}
              onSubmit={onSave}
              initialValue={digits.current}
            />
            <Input
              ref={(ref) => (textFieldRefs.current.unit = ref)}
              label={t('meter:input_placeholder_unit')}
              outerContainerStyle={{ flex: 3 }}
              onChangeText={(value) => (unit.current = value)}
              validation={['required']}
              validationMessages={[t('validationMessage:required')]}
              onSubmit={onSave}
              initialValue={unit.current}
            />
          </View>

          <View style={{ marginBottom: 8, marginTop: 8 }}>
            <Checkbox
              label={t('meter:input_placeholder_is_refillable')}
              color={Colors.primary}
              value={formBoolState.isRefillable}
              onValueChange={(isRefillable: boolean) =>
                setFormBoolState({
                  ...formBoolState,
                  isRefillable,
                })
              }
            />
          </View>
          <View style={{ marginBottom: 8 }}>
            <Checkbox
              label={t('meter:input_placeholder_is_positive')}
              color={Colors.primary}
              value={formBoolState.areValuesDepleting}
              onValueChange={(areValuesDepleting: boolean) =>
                setFormBoolState({
                  ...formBoolState,
                  areValuesDepleting,
                })
              }
            />
          </View>
        </View>

        <View
          style={{
            paddingHorizontal: 16,
          }}
        >
          <Text
            style={{
              ...Typography.LabelSmall,
              marginTop: 8,
              marginBottom: 8,
            }}
          >
            {t('contract:contract')}
          </Text>
          {allContracts.value.map((contract) => (
            <ContractSelectEntry
              key={contract.id}
              contract={contract}
              selectedContract={selectedContract}
            />
          ))}

          <Button
            label={t('home_screen:add_new_contract')}
            icon={AddIcon}
            onPress={() =>
              navigation.navigate('AddContractModal', {
                onEndEditing: (contract) => (selectedContract.value = contract.id ?? null),
              })
            }
          />
        </View>

        {settings.featureFlagMultipleBuildings.content.value && (
          <View
            style={{
              paddingHorizontal: 16,
            }}
          >
            <>
              <Text
                style={{
                  ...Typography.LabelSmall,
                  marginTop: 8,
                  marginBottom: 8,
                }}
              >
                {t('buildings:buildings')}
              </Text>

              {detailedBuildings.value
                .filter(({ id }) => id !== DEFAULT_BUILDING_ID)
                .map((building) => (
                  <BuildingSelectEntry
                    key={building.id}
                    building={building}
                    selectedBuilding={selectedBuilding}
                    setSelectedBuilding={setSelectedBuilding}
                  />
                ))}

              <Button
                label={t('buildings:add_building')}
                icon={AddIcon}
                onPress={() =>
                  navigation.navigate('AddBuildingModal', {
                    onEndEditing: (building) => setSelectedBuilding(building.id),
                  })
                }
              />
            </>
          </View>
        )}
      </ScrollView>

      {/* Use a light status bar on iOS to account for the black space above the modal */}
      <StatusBar style={Platform.OS === 'ios' ? 'light' : 'auto'} />
    </SafeAreaView>
  )
}
