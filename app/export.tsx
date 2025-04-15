import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native'
import { Stack } from 'expo-router/stack'
import { makeHeaderBackButton } from '@/modules/general/components/header/HeaderBackButton'
import { GestureHandlerRootView } from 'react-native-gesture-handler'
import { useColors, useDefaultStyles } from '@/modules/general/theme'
import * as DocumentPicker from 'expo-document-picker'
import { Fragment, useMemo, useState } from 'react'
import { cacheDirectory, EncodingType, readAsStringAsync, writeAsStringAsync } from 'expo-file-system'
import { HeaderButtons } from '@/modules/general/components/header'
import { Button, useSelectField } from '@/modules/general/components'
import { useFieldContext, useForm } from '@formsignals/form-react'
import { parseCSV } from '@/modules/settings/serialization'
import {
  CalendarIcon,
  CheckIcon,
  CheckSquareIcon,
  ChevronDownIcon,
  IdCardIcon,
  LanguagesIcon,
  SigmaIcon,
  SquareIcon,
  WholeWordIcon,
} from 'lucide-react-native'
import {
  Checkbox,
  CheckboxForm,
} from '@/modules/general/components/inputs/Checkbox'
import { FilePicker } from '@/modules/general/components/inputs/FilePicker'
import { importLegacyCSV } from '@/database/import'
import { Signal } from '@preact/signals-core'
import { useSignalEffect } from '@preact/signals-react'
import { useSignals } from '@preact/signals-react/runtime'
import { exportCSV } from '@/database/export'
import { isAvailableAsync, shareAsync } from 'expo-sharing'
import { translate } from '@/modules/general/translations'

export default function Page() {
  useSignals()
  const colors = useColors()
  const defaultStyles = useDefaultStyles()

  const styles = useMemo(
    () =>
      StyleSheet.create({
        sectionHeader: {
          ...defaultStyles.detail,
          marginTop: 16,
          marginBottom: 8,
        },
        entityButtonContainer: {
          flexDirection: 'row',
          flexWrap: 'wrap',
          gap: 8,
        },
      }),
    [defaultStyles],
  )

  const form = useForm({
    defaultValues: {
      include: {
        buildings: {
          id: true,
          name: true,
          address: true,
          notes: true,
          isDefault: true,
        },
        contracts: {
          id: true,
          name: true,
          identifier: true,
          unit: true,
          buildingId: true,
        },
        contractRevisions: {
          pricePerUnit: true,
          basePayment: true,
          monthlyPayment: true,
          startDate: true,
          endDate: true,
          contractId: true,
        },
        meters: {
          id: true,
          name: true,
          precision: true,
          isActive: true,
          sortOrder: true,
          customUnitConversion: true,
          buildingId: true,
          contractId: true,
          type: true,
          unit: true,
        },
        readings: {
          value: true,
          timestamp: true,
          valueBeforeReset: true,
          meterId: true,
        },
      },
    },
    onSubmit: async (values) => {
      if(!await isAvailableAsync()) return;

      const csvString = await exportCSV(values)
      const exportFileName = `meter_tracker-export_${new Date().toISOString()}.csv`
      const fileUri = `${cacheDirectory}${exportFileName}`

      await writeAsStringAsync(fileUri, csvString, {
        encoding: EncodingType.UTF8,
      })

      await shareAsync(fileUri)
    },
  })

  return (
    <GestureHandlerRootView
      style={[
        defaultStyles.pageContainer,
        defaultStyles.resetPaddingHorizontal,
      ]}
    >
      <Stack.Screen
        options={{
          title: translate('settings.export.pageTitle'),
          headerTitleStyle: defaultStyles.pageHeader,
          headerLeft: makeHeaderBackButton(true),
          headerRight: () => (
            <HeaderButtons hideSettings>
              <Button
                onPressIn={() => form.handleSubmit()}
                disabled={!form.canSubmit.value}
              >
                {translate('settings.export.startButton')}
              </Button>
            </HeaderButtons>
          ),
        }}
      />

      <ScrollView
        contentContainerStyle={[
          { paddingBottom: 24 + 16 },
          defaultStyles.pageContainerPaddingHorizontal,
        ]}
      >
        <Text style={styles.sectionHeader}>{translate("settings.export.headerBuildings")}</Text>
        <View
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            flexDirection: 'row',
            gap: 8,
          }}
        >
          <IncludeToggle
            label={translate('settings.export.buildings.id')}
            value={form.data.peek().include.peek().buildings.peek().id}
          />
          <IncludeToggle
            label={translate('settings.export.buildings.name')}
            value={form.data.peek().include.peek().buildings.peek().name}
          />
          <IncludeToggle
            label={translate('settings.export.buildings.address')}
            value={form.data.peek().include.peek().buildings.peek().address}
          />
          <IncludeToggle
            label={translate('settings.export.buildings.notes')}
            value={form.data.peek().include.peek().buildings.peek().notes}
          />
          <IncludeToggle
            label={translate('settings.export.buildings.isDefault')}
            value={form.data.peek().include.peek().buildings.peek().isDefault}
          />
        </View>

        <Text style={styles.sectionHeader}>{translate("settings.export.headerContracts")}</Text>
        <View
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            flexDirection: 'row',
            gap: 8,
          }}
        >
          <IncludeToggle
            label={translate('settings.export.contracts.id')}
            value={form.data.peek().include.peek().contracts.peek().id}
          />
          <IncludeToggle
            label={translate('settings.export.contracts.name')}
            value={form.data.peek().include.peek().contracts.peek().name}
          />
          <IncludeToggle
            label={translate('settings.export.contracts.identifier')}
            value={form.data.peek().include.peek().contracts.peek().identifier}
          />
          <IncludeToggle
            label={translate('settings.export.contracts.unit')}
            value={form.data.peek().include.peek().contracts.peek().unit}
          />
          <IncludeToggle
            label={translate('settings.export.contracts.buildingId')}
            value={form.data.peek().include.peek().contracts.peek().buildingId}
          />
        </View>

        <Text style={styles.sectionHeader}>{translate("settings.export.headerContractRevision")}</Text>
        <View
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            flexDirection: 'row',
            gap: 8,
          }}
        >
          <IncludeToggle
            label={translate('settings.export.contractRevision.pricePerUnit')}
            value={
              form.data.peek().include.peek().contractRevisions.peek()
                .pricePerUnit
            }
          />
          <IncludeToggle
            label={translate('settings.export.contractRevision.basePayment')}
            value={
              form.data.peek().include.peek().contractRevisions.peek()
                .basePayment
            }
          />
          <IncludeToggle
            label={translate('settings.export.contractRevision.monthlyPayment')}
            value={
              form.data.peek().include.peek().contractRevisions.peek()
                .monthlyPayment
            }
          />
          <IncludeToggle
            label={translate('settings.export.contractRevision.startDate')}
            value={
              form.data.peek().include.peek().contractRevisions.peek().startDate
            }
          />
          <IncludeToggle
            label={translate('settings.export.contractRevision.endDate')}
            value={
              form.data.peek().include.peek().contractRevisions.peek().endDate
            }
          />
          <IncludeToggle
            label={translate('settings.export.contractRevision.contractId')}
            value={
              form.data.peek().include.peek().contractRevisions.peek()
                .contractId
            }
          />
        </View>

        <Text style={styles.sectionHeader}>{translate("settings.export.headerMeters")}</Text>
        <View
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            flexDirection: 'row',
            gap: 8,
          }}
        >
          <IncludeToggle
            label={translate('settings.export.meters.id')}
            value={form.data.peek().include.peek().meters.peek().id}
          />
          <IncludeToggle
            label={translate('settings.export.meters.name')}
            value={form.data.peek().include.peek().meters.peek().name}
          />
          <IncludeToggle
            label={translate('settings.export.meters.precision')}
            value={form.data.peek().include.peek().meters.peek().precision}
          />
          {/*<IncludeToggle*/}
          {/*  label="isActive"*/}
          {/*  value={form.data.peek().include.peek().meters.peek().isActive}*/}
          {/*/>*/}
          <IncludeToggle
            label={translate('settings.export.meters.sortOrder')}
            value={form.data.peek().include.peek().meters.peek().sortOrder}
          />
          <IncludeToggle
            label={translate('settings.export.meters.customUnitConversion')}
            value={
              form.data.peek().include.peek().meters.peek().customUnitConversion
            }
          />
          <IncludeToggle
            label={translate('settings.export.meters.type')}
            value={form.data.peek().include.peek().meters.peek().type}
          />
          <IncludeToggle
            label={translate('settings.export.meters.unit')}
            value={form.data.peek().include.peek().meters.peek().unit}
          />
          <IncludeToggle
            label={translate('settings.export.meters.buildingId')}
            value={form.data.peek().include.peek().meters.peek().buildingId}
          />
          <IncludeToggle
            label={translate('settings.export.meters.contractId')}
            value={form.data.peek().include.peek().meters.peek().contractId}
          />
        </View>

        <Text style={styles.sectionHeader}>{translate("settings.export.headerMeterReadings")}</Text>
        <View
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            flexDirection: 'row',
            gap: 8,
          }}
        >
          <IncludeToggle
            label={translate('settings.export.meterReadings.value')}
            value={form.data.peek().include.peek().readings.peek().value}
          />
          <IncludeToggle
            label={translate('settings.export.meterReadings.timestamp')}
            value={form.data.peek().include.peek().readings.peek().timestamp}
          />
          <IncludeToggle
            label={translate('settings.export.meterReadings.valueBeforeReset')}
            value={
              form.data.peek().include.peek().readings.peek().valueBeforeReset
            }
          />
          <IncludeToggle
            label={translate('settings.export.meterReadings.meterId')}
            value={form.data.peek().include.peek().readings.peek().meterId}
          />
        </View>
      </ScrollView>
    </GestureHandlerRootView>
  )
}

function IncludeToggle({
  label,
  value,
}: {
  label: string
  value: Signal<boolean>
}) {
  useSignals()
  const colors = useColors()

  return (
    <Button
      size="large"
      variant="ghost"
      style={{
        backgroundColor: colors.card,
        opacity: value.value ? 1 : 0.4,
        paddingInline: 8,
        paddingBlock: 4
      }}
      onPress={() => (value.value = !value.value)}
    >
      {label + " "}
    </Button>
  )
}
