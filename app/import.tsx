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
import {CheckIcon, ChevronDownIcon, IdCardIcon, LanguagesIcon, WholeWordIcon} from "lucide-react-native";
import {Checkbox, CheckboxForm} from "@/modules/general/components/Checkbox";

type FileInfo = {
  name: string
  uri: string
  headers: string[]
}

export default function Page() {
  const colors = useColors()
  const defaultStyles = useDefaultStyles()
  const [fileInfo, setFileInfo] = useState<FileInfo | null>(null)

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
      includedEntities: {
        buildings: true,
        contracts: false,
        contractRevisions: false,
        meters: true,
        readings: true
      },
      mapping: {
        buildings: {
          id: null as string | null,
          name: null as string | null,
          address: null as string | null,
          notes: null as string | null,
          isDefault: null as string | null
        },
        contracts: {
          id: null as string | null,
          name: null as string | null,
          identifier: null as string | null,
          unit: null as string | null,
          buildingId: null as string | null
        },
        contractRevisions: {
          pricePerUnit: null as string | null,
          basePayment: null as string | null,
          monthlyPayment: null as string | null,
          startDate: null as string | null,
          endDate: null as string | null,
          contractId: null as string | null
        },
        meters: {
          name: null as string | null,
          precision: null as string | null,
          valueBeforeReset: null as string | null,
          isActive: null as string | null,
          sortOrder: null as string | null,
          customUnitConversion: null as string | null,
          buildingId: null as string | null,
          contractId: null as string | null,
          type: null as string | null,
          unit: null as string | null
        },
        readings: {
          value: null as string | null,
          timestamp: null as string | null,
          meterId: null as string | null
        }
      }
    }
  })

  const headerOptions = fileInfo?.headers?.map(header => ({
    label: header,
    value: header
  })) ?? []

  const buildingIdSelect = useSelectField({
    value: form.data.peek().mapping.peek().buildings.peek().id,
    options: headerOptions
  })
  const buildingNameSelect = useSelectField({
    value: form.data.peek().mapping.peek().buildings.peek().name,
    options: headerOptions
  })
  const buildingAddressSelect = useSelectField({
    value: form.data.peek().mapping.peek().buildings.peek().address,
    options: headerOptions
  })
  const buildingNotesSelect = useSelectField({
    value: form.data.peek().mapping.peek().buildings.peek().notes,
    options: headerOptions
  })
  const buildingIsDefaultSelect = useSelectField({
    value: form.data.peek().mapping.peek().buildings.peek().isDefault,
    options: headerOptions
  })

  const contractIdSelect = useSelectField({
    value: form.data.peek().mapping.peek().contracts.peek().id,
    options: headerOptions
  })
  const contractNameSelect = useSelectField({
    value: form.data.peek().mapping.peek().contracts.peek().name,
    options: headerOptions
  })
  const contractIdentifierSelect = useSelectField({
    value: form.data.peek().mapping.peek().contracts.peek().identifier,
    options: headerOptions
  })
  const contractUnitSelect = useSelectField({
    value: form.data.peek().mapping.peek().contracts.peek().unit,
    options: headerOptions
  })
  const contractBuildingIdSelect = useSelectField({
    value: form.data.peek().mapping.peek().contracts.peek().buildingId,
    options: headerOptions
  })

  const contractRevisionPricePerUnitSelect = useSelectField({
    value: form.data.peek().mapping.peek().contractRevisions.peek().pricePerUnit,
    options: headerOptions
  })
  const contractRevisionBasePaymentSelect = useSelectField({
    value: form.data.peek().mapping.peek().contractRevisions.peek().basePayment,
    options: headerOptions
  })
  const contractRevisionMonthlyPaymentSelect = useSelectField({
    value: form.data.peek().mapping.peek().contractRevisions.peek().monthlyPayment,
    options: headerOptions
  })
  const contractRevisionStartDateSelect = useSelectField({
    value: form.data.peek().mapping.peek().contractRevisions.peek().startDate,
    options: headerOptions
  })
  const contractRevisionEndDateSelect = useSelectField({
    value: form.data.peek().mapping.peek().contractRevisions.peek().endDate,
    options: headerOptions
  })
  const contractRevisionContractIdSelect = useSelectField({
    value: form.data.peek().mapping.peek().contractRevisions.peek().contractId,
    options: headerOptions
  })

  const meterNameSelect = useSelectField({
    value: form.data.peek().mapping.peek().meters.peek().name,
    options: headerOptions
  })
  const meterPrecisionSelect = useSelectField({
    value: form.data.peek().mapping.peek().meters.peek().precision,
    options: headerOptions
  })
  const meterValueBeforeResetSelect = useSelectField({
    value: form.data.peek().mapping.peek().meters.peek().valueBeforeReset,
    options: headerOptions
  })
  const meterIsActiveSelect = useSelectField({
    value: form.data.peek().mapping.peek().meters.peek().isActive,
    options: headerOptions
  })
  const meterSortOrderSelect = useSelectField({
    value: form.data.peek().mapping.peek().meters.peek().sortOrder,
    options: headerOptions
  })
  const meterCustomUnitConversionSelect = useSelectField({
    value: form.data.peek().mapping.peek().meters.peek().customUnitConversion,
    options: headerOptions
  })
  const meterBuildingIdSelect = useSelectField({
    value: form.data.peek().mapping.peek().meters.peek().buildingId,
    options: headerOptions
  })
  const meterContractIdSelect = useSelectField({
    value: form.data.peek().mapping.peek().meters.peek().contractId,
    options: headerOptions
  })
  const meterTypeSelect = useSelectField({
    value: form.data.peek().mapping.peek().meters.peek().type,
    options: headerOptions
  })
  const meterUnitSelect = useSelectField({
    value: form.data.peek().mapping.peek().meters.peek().unit,
    options: headerOptions
  })

  const readingValueSelect = useSelectField({
    value: form.data.peek().mapping.peek().readings.peek().value,
    options: headerOptions
  })
  const readingTimestampSelect = useSelectField({
    value: form.data.peek().mapping.peek().readings.peek().timestamp,
    options: headerOptions
  })
  const readingMeterIdSelect = useSelectField({
    value: form.data.peek().mapping.peek().readings.peek().meterId,
    options: headerOptions
  })

  return (
    <GestureHandlerRootView
      style={[defaultStyles.pageContainer, defaultStyles.resetPaddingHorizontal]}
    >
      <Stack.Screen
        options={{
          title: 'Import',
          headerTitleStyle: defaultStyles.pageHeader,
          headerLeft: makeHeaderBackButton(true),
          headerRight: () => (
            <HeaderButtons hideSettings>
              <Button onPress={() => console.log("Import")}>
                Start import
              </Button>
            </HeaderButtons>
          )
        }}
      />

      <Text style={styles.sectionHeader}>File</Text>
      <TouchableOpacity
        onPress={() => {
          DocumentPicker.getDocumentAsync({
            type: ["text/csv", "text/comma-separated-values"],
            multiple: false,
            copyToCacheDirectory: true
          }).then(async res => {
            console.log("File selected", res)
            if (res.canceled || !res.assets[0]) return
            const file = res.assets[0]

            if (!file.size || file.size > 1_000_000) {
              console.error("File too large")
              return
            }
            console.log("Reading file", file)
            // TODO Add pagination and chunking and only reading header line in the beginning

            const csvString = await readAsStringAsync(file.uri, {
              length: 100
            })
            const [headers] = parseCSV(csvString)

            setFileInfo({
              name: file.name,
              uri: file.uri,
              headers
            })
          })
        }}
      >
        <Text style={defaultStyles.outlineButton}>{fileInfo ? fileInfo.name : "Select file"}</Text>
      </TouchableOpacity>

      <form.FieldProvider name="clearExisting">
        <CheckboxForm
          label="Clear existing data"
          style={{marginTop: 8}}
        />
      </form.FieldProvider>

      <Text style={styles.sectionHeader}>Entities to import</Text>
      <View style={styles.entityButtonContainer}>
        <form.FieldProvider name="includedEntities">
          <EntityButtons/>
        </form.FieldProvider>
      </View>

      <ScrollView contentContainerStyle={{paddingBottom: 24 + 16}}>
        {form.data.peek().includedEntities.peek().buildings.value && (<Fragment>
          <Text style={styles.sectionHeader}>Buildings</Text>
          <buildingIdSelect.SelectField renderField={MappingSelectFieldRender("ID", "id")} />
          <buildingNameSelect.SelectField renderField={MappingSelectFieldRender("Name", "string")} />
          <buildingAddressSelect.SelectField renderField={MappingSelectFieldRender("Address", "string")} />
          <buildingNotesSelect.SelectField renderField={MappingSelectFieldRender("Notes", "string")} />
          <buildingIsDefaultSelect.SelectField renderField={MappingSelectFieldRender("Is Default", "boolean")} />
        </Fragment>)}
        {form.data.peek().includedEntities.peek().contracts.value && (<Fragment>
          <Text style={styles.sectionHeader}>Contract</Text>
          <contractIdSelect.SelectField renderField={MappingSelectFieldRender("ID", "id")} />
          <contractNameSelect.SelectField renderField={MappingSelectFieldRender("Name", "string")} />
          <contractIdentifierSelect.SelectField renderField={MappingSelectFieldRender("Identifier", "string")} />
          <contractUnitSelect.SelectField renderField={MappingSelectFieldRender("Unit", "select")} />
          <contractBuildingIdSelect.SelectField renderField={MappingSelectFieldRender("Building ID", "id")} />
        </Fragment>)}
        {form.data.peek().includedEntities.peek().contractRevisions.value && (<Fragment>
        <Text style={styles.sectionHeader}>Contract Revision</Text>
        <Text style={defaultStyles.bodyText}>Price per unit</Text>
        <Text style={defaultStyles.bodyText}>Base payment</Text>
        <Text style={defaultStyles.bodyText}>Monthly payment</Text>
        <Text style={defaultStyles.bodyText}>Start date</Text>
        <Text style={defaultStyles.bodyText}>End date</Text>
        <Text style={defaultStyles.bodyText}>Contract Id</Text>
        </Fragment>)}
        {form.data.peek().includedEntities.peek().meters.value && (<Fragment>
        <Text style={styles.sectionHeader}>Meter</Text>
        <Text style={defaultStyles.bodyText}>Name</Text>
        <Text style={defaultStyles.bodyText}>Precision</Text>
        <Text style={defaultStyles.bodyText}>Value before reset</Text>
        <Text style={defaultStyles.bodyText}>isActive</Text>
        <Text style={defaultStyles.bodyText}>Sort Order</Text>
        <Text style={defaultStyles.bodyText}>Custom unit conversion</Text>
        <Text style={defaultStyles.bodyText}>Building Id</Text>
        <Text style={defaultStyles.bodyText}>Contract Id</Text>
        <Text style={defaultStyles.bodyText}>Type</Text>
        <Text style={defaultStyles.bodyText}>Unit</Text>
        </Fragment>)}
        {form.data.peek().includedEntities.peek().readings.value && (<Fragment>
        <Text style={styles.sectionHeader}>Reading</Text>
        <Text style={defaultStyles.bodyText}>Value</Text>
        <Text style={defaultStyles.bodyText}>Timestamp</Text>
        <Text style={defaultStyles.bodyText}>Meter Id</Text>
        </Fragment>)}

        <View style={{flex: 1}}>
          {fileInfo?.headers?.map((header) => (
            <Text
              key={header}
              style={defaultStyles.detail}
            >{header}</Text>
          ))}
        </View>
      </ScrollView>

      <buildingIdSelect.SelectFieldSheet />
      <buildingNameSelect.SelectFieldSheet />
      <buildingAddressSelect.SelectFieldSheet />
      <buildingNotesSelect.SelectFieldSheet />
      <buildingIsDefaultSelect.SelectFieldSheet />
      <contractIdSelect.SelectFieldSheet />
      <contractNameSelect.SelectFieldSheet />
      <contractIdentifierSelect.SelectFieldSheet />
      <contractUnitSelect.SelectFieldSheet />
      <contractBuildingIdSelect.SelectFieldSheet />
      <contractRevisionPricePerUnitSelect.SelectFieldSheet />
      <contractRevisionBasePaymentSelect.SelectFieldSheet />
      <contractRevisionMonthlyPaymentSelect.SelectFieldSheet />
      <contractRevisionStartDateSelect.SelectFieldSheet />
      <contractRevisionEndDateSelect.SelectFieldSheet />
      <contractRevisionContractIdSelect.SelectFieldSheet />
      <meterNameSelect.SelectFieldSheet />
      <meterPrecisionSelect.SelectFieldSheet />
      <meterValueBeforeResetSelect.SelectFieldSheet />
      <meterIsActiveSelect.SelectFieldSheet />
      <meterSortOrderSelect.SelectFieldSheet />
      <meterCustomUnitConversionSelect.SelectFieldSheet />
      <meterBuildingIdSelect.SelectFieldSheet />
      <meterContractIdSelect.SelectFieldSheet />
      <meterTypeSelect.SelectFieldSheet />
      <meterUnitSelect.SelectFieldSheet />
      <readingValueSelect.SelectFieldSheet />
      <readingTimestampSelect.SelectFieldSheet />
      <readingMeterIdSelect.SelectFieldSheet />

    </GestureHandlerRootView>
  )
}

function EntityButtons() {
  const colors = useColors()
  const field = useFieldContext<Record<string, boolean>, "">()

  const entities = Object.entries(field.data.value)
  return entities.map(([key, value]) => (
    <Button
      key={key}
      variant="ghost"
      style={{
        backgroundColor: colors.card,
        opacity: value.value ? 1 : 0.4
      }}
      onPress={() => {
        value.value = !value.peek()
      }}
    >
      {key}
    </Button>
  ))
}

function MappingSelectFieldRender(label: string, type: "id" | "string" | "boolean" | "select") {
  return function({selectedValue, onOpen}: {selectedValue: {value: string | null}, onOpen: () => void}) {
    const colors = useColors()
    const defaultStyles = useDefaultStyles()

    const Icon = type === "id" ? IdCardIcon : type === "string" ? LanguagesIcon : type === "boolean" ? CheckIcon : type === "select" ? WholeWordIcon : null

    return (
      <Button
        size="large"
        onPress={onOpen}
        IconStart={<Icon
          size={16}
          stroke={colors.textMuted}
        />}
        IconEnd={<ChevronDownIcon
          size={16}
          stroke={colors.textMuted}
        />}
        variant="text"
      >
      <View style={{flex: 1}}>
        <Text style={defaultStyles.bodyText}>
          {label}
        </Text>
        <Text style={defaultStyles.detailSmall}>
          {selectedValue?.value ? `Maps to ${selectedValue?.value}` : "No mapping selected"}
        </Text>
      </View>
    </Button>
    )
  }
}