import { StatusBar } from 'expo-status-bar'
import * as React from 'react'
import { useCallback, useEffect, useRef, useState } from 'react'
import { Platform, TextInput } from 'react-native'
import { ScrollView } from 'react-native-gesture-handler'
import Ripple from 'react-native-material-ripple'
import { SafeAreaView } from 'react-native-safe-area-context'

import { Colors, Text, View } from 'react-native-ui-lib'
import { AppBar } from '../../components/AppBar'
import { IconButton } from '../../components/IconButton'
import { CloseIcon } from '../../components/icons/CloseIcon'
import { Input, type InputRef } from '../../components/Input'
import { type HomeStackScreenProps } from '../../navigation/types'
import { useRepository } from '../../services/database/GenericRepository'
import { t } from '../../services/i18n'
import { Typography } from '../../setupTheme'
import Building from '../../services/database/entities/building'
import BuildingService from '../../services/database/services/BuildingService'
import { Truthy } from '../../utils/CommonUtils'
import { Button } from '../../components/Button'
import type Meter from '../../services/database/entities/meter'
import MeterService from '../../services/database/services/MeterService'
import EventEmitter from '../../services/events'
import { CheckCircleIcon } from '../../components/icons/CheckCircleIcon'

export default function AddBuildingModal({
  navigation,
  route: {
    params: { editBuilding, onEndEditing },
  },
}: HomeStackScreenProps<'AddBuildingModal'>) {
  const [repository] = useRepository<Building, BuildingService>(BuildingService)
  const [meterRepository, meterService] = useRepository<Meter, MeterService>(MeterService)

  const [loading, setLoading] = useState(false)

  const name = useRef(editBuilding?.name ?? '')
  const address = useRef(editBuilding?.address ?? '')
  const notes = useRef(editBuilding?.notes ?? '')

  const [numberOfConnectedMeters, setNumberOfConnectedMeters] = useState(0)
  useEffect(() => {
    if (!editBuilding?.id) return

    meterRepository
      .executeRaw<Array<Meter>>(meterService.getMetersForBuildingStatement(editBuilding.id))
      .then((res) => setNumberOfConnectedMeters(res?.length ?? 0))
  }, [editBuilding?.id, meterRepository, meterService])

  const textFieldRefs = useRef({
    name: null,
    address: null,
    notes: null,
  } as Record<string, InputRef | null>)

  const onSave = useCallback(async () => {
    const validations = Object.values(textFieldRefs.current)
    validations.filter(Truthy).forEach((validation) => validation.validate())
    if (validations.filter(Truthy).some((validation) => !validation.isValid())) {
      return
    }

    setLoading(true)

    const building = new Building(name.current, address.current, notes.current)
    if (!editBuilding) {
      const newlyCreatedBuilding = await repository.insertData(building)
      if (newlyCreatedBuilding) {
        onEndEditing?.(newlyCreatedBuilding)
      }
    } else {
      building.id = editBuilding.id
      await repository.updateData(building)
      onEndEditing?.(building)
    }

    setLoading(false)
    navigation.pop()
  }, [editBuilding, navigation, onEndEditing, repository])

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
        title={t('buildings:add_building')}
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
            ref={(ref) => (textFieldRefs.current.address = ref)}
            label={t('buildings:input_placeholder_address')}
            onChangeText={(value) => (address.current = value)}
            onSubmit={onSave}
            initialValue={address.current}
          />
          <Text style={{ ...Typography.LabelMedium, marginBottom: 4 }}>
            {t('buildings:input_placeholder_notes')}
          </Text>
          <TextInput
            multiline
            numberOfLines={3}
            style={{
              ...Typography.BodyLarge,
              borderColor: Colors.outline,
              borderWidth: 1,
              borderRadius: 4,
              backgroundColor: Colors.surfaceVariant,
              marginBottom: 16,
              paddingHorizontal: 16,
              paddingVertical: 8,
              color: Colors.onSurface,
            }}
            onChangeText={(value) => (notes.current = value)}
            defaultValue={notes.current}
            textAlignVertical={'top'}
          />
        </View>

        {!!editBuilding?.id && (
          <View style={{ paddingHorizontal: 16 }}>
            <Button
              label={t('buildings:delete_building')}
              color="error"
              onPress={async () => {
                await repository.deleteEntry(editBuilding!.id!)

                let didUndo = false
                EventEmitter.emitToast({
                  message: t('utils:deleted_building'),
                  icon: CheckCircleIcon,
                  action: {
                    label: t('utils:undo'),
                    onPress: () => {
                      if (didUndo) {
                        return
                      }

                      didUndo = true
                      EventEmitter.emitToast(undefined)
                      repository.insertData(editBuilding!)
                    },
                  },
                })

                navigation.pop()
              }}
            />
            {!!numberOfConnectedMeters && (
              <Text style={{ ...Typography.LabelSmall, color: Colors.error }}>
                {t(
                  numberOfConnectedMeters > 1
                    ? 'buildings:delete_building_warning_plural'
                    : 'buildings:delete_building_warning',
                  { numberOfConnectedMeters }
                )}
              </Text>
            )}
          </View>
        )}
      </ScrollView>

      {/* Use a light status bar on iOS to account for the black space above the modal */}
      <StatusBar style={Platform.OS === 'ios' ? 'light' : 'auto'} />
    </SafeAreaView>
  )
}
