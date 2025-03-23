import {ScrollView, StyleSheet, Text, TouchableOpacity, View} from 'react-native'
import {Stack} from 'expo-router/stack'
import {makeHeaderBackButton} from '@/modules/general/components/header/HeaderBackButton'
import {GestureHandlerRootView} from 'react-native-gesture-handler'
import {useColors, useDefaultStyles} from '@/modules/general/theme'
import * as DocumentPicker from 'expo-document-picker';
import {Fragment, useMemo, useState} from "react";
import {readAsStringAsync} from "expo-file-system";
import {HeaderButtons} from "@/modules/general/components/header";
import {Button, useSelectField} from "@/modules/general/components";
import {useFieldContext, useForm} from "@formsignals/form-react";
import {parseCSV} from "@/modules/settings/serialization";
import {
  CalendarIcon,
  CheckIcon, CheckSquareIcon,
  ChevronDownIcon,
  IdCardIcon,
  LanguagesIcon,
  SigmaIcon, SquareIcon,
  WholeWordIcon
} from "lucide-react-native";
import {Checkbox, CheckboxForm} from "@/modules/general/components/inputs/Checkbox";
import {FilePicker} from "@/modules/general/components/inputs/FilePicker";
import {importLegacyCSV} from "@/database/import";
import {Signal} from "@preact/signals-core";
import {useSignalEffect} from "@preact/signals-react";

export default function Page() {
  const colors = useColors()
  const defaultStyles = useDefaultStyles()

  const styles = useMemo(() => StyleSheet.create({
    sectionHeader: {
      ...defaultStyles.detail,
      marginTop: 16,
      marginBottom: 8
    },
    entityButtonContainer: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 8,
    }
  }), [defaultStyles])

  const form = useForm({
    defaultValues: {
      clearExisting: true,
      include: {
        buildings: {
          id: true,
          name: true,
          address: true,
          notes: true,
          isDefault: true
        },
        contracts: {
          id: true,
          name: true,
          identifier: true,
          unit: true,
          buildingId: true
        },
        contractRevisions: {
          pricePerUnit: true,
          basePayment: true,
          monthlyPayment: true,
          startDate: true,
          endDate: true,
          contractId: true
        },
        meters: {
          id: true,
          name: true,
          precision: true,
          valueBeforeReset: true,
          isActive: true,
          sortOrder: true,
          customUnitConversion: true,
          buildingId: true,
          contractId: true,
          type: true,
          unit: true
        },
        readings: {
          value: true,
          timestamp: true,
          meterId: true
        }
      }
    },
    onSubmit: async (values) => {
      console.log("Export", values)
    }
  })

  return (
    <GestureHandlerRootView
      style={[defaultStyles.pageContainer, defaultStyles.resetPaddingHorizontal]}
    >
      <Stack.Screen
        options={{
          title: 'Export',
          headerTitleStyle: defaultStyles.pageHeader,
          headerLeft: makeHeaderBackButton(true),
          headerRight: () => (
            <HeaderButtons hideSettings>
              <Button onPress={() => form.handleSubmit()}>
                Start export
              </Button>
            </HeaderButtons>
          )
        }}
      />

      <ScrollView style={{marginTop: 16}} contentContainerStyle={[{paddingBottom: 24 + 16}, defaultStyles.pageContainerPaddingHorizontal]}>
        <Text style={styles.sectionHeader}>Buildings</Text>
        <IncludeToggle label="ID" value={form.data.peek().include.peek().buildings.peek().id} />
        <IncludeToggle label="Name" value={form.data.peek().include.peek().buildings.peek().name} />
        <IncludeToggle label="Address" value={form.data.peek().include.peek().buildings.peek().address} />
        <IncludeToggle label="Notes" value={form.data.peek().include.peek().buildings.peek().notes} />
        <IncludeToggle label="Is Default" value={form.data.peek().include.peek().buildings.peek().isDefault} />

        <Text style={styles.sectionHeader}>Contract</Text>
        <IncludeToggle label="ID" value={form.data.peek().include.peek().contracts.peek().id} />
        <IncludeToggle label="Name" value={form.data.peek().include.peek().contracts.peek().name} />
        <IncludeToggle label="Identifier" value={form.data.peek().include.peek().contracts.peek().identifier} />
        <IncludeToggle label="Unit" value={form.data.peek().include.peek().contracts.peek().unit} />
        <IncludeToggle label="Building ID" value={form.data.peek().include.peek().contracts.peek().buildingId} />

        <Text style={styles.sectionHeader}>Contract Revision</Text>
        <IncludeToggle label="Price per unit" value={form.data.peek().include.peek().contractRevisions.peek().pricePerUnit} />
        <IncludeToggle label="Base payment" value={form.data.peek().include.peek().contractRevisions.peek().basePayment} />
        <IncludeToggle label="Monthly payment" value={form.data.peek().include.peek().contractRevisions.peek().monthlyPayment} />
        <IncludeToggle label="Start date" value={form.data.peek().include.peek().contractRevisions.peek().startDate} />
        <IncludeToggle label="End date" value={form.data.peek().include.peek().contractRevisions.peek().endDate} />
        <IncludeToggle label="Contract ID" value={form.data.peek().include.peek().contractRevisions.peek().contractId} />

        <Text style={styles.sectionHeader}>Meter</Text>
        <IncludeToggle label="ID" value={form.data.peek().include.peek().meters.peek().id} />
        <IncludeToggle label="Name" value={form.data.peek().include.peek().meters.peek().name} />
        <IncludeToggle label="Precision" value={form.data.peek().include.peek().meters.peek().precision} />
        <IncludeToggle label="Value before reset" value={form.data.peek().include.peek().meters.peek().valueBeforeReset} />
        <IncludeToggle label="isActive" value={form.data.peek().include.peek().meters.peek().isActive} />
        <IncludeToggle label="Sort Order" value={form.data.peek().include.peek().meters.peek().sortOrder} />
        <IncludeToggle label="Custom unit conversion" value={form.data.peek().include.peek().meters.peek().customUnitConversion} />
        <IncludeToggle label="Type" value={form.data.peek().include.peek().meters.peek().type} />
        <IncludeToggle label="Unit" value={form.data.peek().include.peek().meters.peek().unit} />
        <IncludeToggle label="Building ID" value={form.data.peek().include.peek().meters.peek().buildingId} />
        <IncludeToggle label="Contract ID" value={form.data.peek().include.peek().meters.peek().contractId} />

        <Text style={styles.sectionHeader}>Reading</Text>
        <IncludeToggle label="Value" value={form.data.peek().include.peek().readings.peek().value} />
        <IncludeToggle label="Timestamp" value={form.data.peek().include.peek().readings.peek().timestamp} />
        <IncludeToggle label="Meter ID" value={form.data.peek().include.peek().readings.peek().meterId} />
      </ScrollView>

    </GestureHandlerRootView>
  )
}

function IncludeToggle({label, value}: {label: string, value: Signal<boolean>}) {
  const colors = useColors()
  const defaultStyles = useDefaultStyles()

  return (
    <Button
      size="large"
      onPress={() => value.value = !value.value}
      IconEnd={value.value ? <CheckSquareIcon
        size={16}
        stroke={colors.textMuted}
      /> : <SquareIcon
        size={16}
        stroke={colors.textMuted}
      />}
      variant="text"
    >
    <Text style={[defaultStyles.bodyText, {flex: 1}]}>
      {label}
    </Text>
  </Button>
  )
}