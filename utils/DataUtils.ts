import { type BuildingsEntity } from '@/buildings/buildings.entity'
import { insertBuildingsFromEntities } from '@/buildings/buildings.persistor'
import { type ContractsEntity } from '@/contracts/contracts.entity'
import { insertContractsFromEntities } from '@/contracts/contracts.persistor'
import {
  type AllDataExport,
  AllDataExportSelector,
  type AllDataImport,
  dropDatabase,
  reloadDatabase,
  runMigrations,
  RunOnDB,
} from '@/database'
import EventEmitter from '@/events'
import { t } from '@/i18n'
import { type MeasurementsEntity } from '@/measurements/measurements.entity'
import { insertMeasurementsFromEntities } from '@/measurements/measurements.persistor'
import { type MetersEntity } from '@/meters/meters.entity'
import { insertMetersFromEntities } from '@/meters/meters.persistor'
import * as DocumentPicker from 'expo-document-picker'
import * as FileSystem from 'expo-file-system'
import * as Sharing from 'expo-sharing'
import lodashSet from 'lodash/set'
import moment from 'moment'
import { Colors } from 'react-native-ui-lib'
import { CheckCircleIcon } from '../components/icons/CheckCircleIcon'
import { ErrorCircleIcon } from '../components/icons/ErrorCircleIcon'
import { InfoCircleIcon } from '../components/icons/InfoCircleIcon'

export const unflattenObject = <R>(obj: object) => {
  const res = {}

  Object.entries(obj).forEach(([key, value]) => {
    lodashSet(res, key, value)
  })

  return res as R
}

const ObjectsToCSVString = (data?: Array<Record<string, unknown>>) => {
  if (!data?.length) {
    return ''
  }

  const csvHeader = Object.keys(data[0]).join(',')
  const csvRows = data.map((row) =>
    Object.values(row)
      .map((value) => JSON.stringify(typeof value === 'string' ? value.replace(/"/g, '""') : value))
      .join(',')
  )

  return [csvHeader, ...csvRows].join('\n')
}

// Regular expression to parse the CSV values. (https://stackoverflow.com/questions/36288375/how-to-parse-csv-data-that-contains-newlines-in-field-using-javascript)
const CSVPattern = new RegExp(
  // Delimiters:
  '(\\,|\\r?\\n|\\r|^)' +
    // Quoted fields.
    '(?:"([^"]*(?:""[^"]*)*)"|' +
    // Standard fields.
    '([^"\\,\\r\\n]*))',
  'gi'
)
export const CSVStringToObjects = (csvString: string): Array<Record<string, unknown>> => {
  const rawRes: Array<Array<string | undefined>> = [[]]

  let regexMatch = CSVPattern.exec(csvString)
  while (regexMatch) {
    const matched_delimiter = regexMatch[1]
    if (matched_delimiter.length && matched_delimiter !== ',') {
      // Since this is a new row of data, add an empty row to the array.
      rawRes.push([])
    }

    const value = regexMatch[2]?.replace(/""/g, '"') ?? regexMatch[3]
    // If we are currently at the first row, then these are the headers
    let parsedValue = value
    try {
      parsedValue = value ? JSON.parse(value) : undefined
    } catch (ignored) {
      // Catch any possible parsing error
    }
    rawRes[rawRes.length - 1].push(parsedValue)

    regexMatch = CSVPattern.exec(csvString)
  }

  const [resHeaders, ...resRows] = rawRes
  return resRows.map((row) =>
    Object.fromEntries(
      row.map((value, index) => [
        resHeaders[index]?.replace('_', '.'),
        value === '' ? undefined : value,
      ])
    )
  )
}

export const databaseToCSVString = async () => {
  const allData = await RunOnDB(AllDataExportSelector)
    .then(
      (res) =>
        res.rows._array.map((element) =>
          Object.fromEntries(
            Object.entries(element).map(([key, value]) => [key.replace(/\./, '_'), value])
          )
        ) as Array<AllDataExport>
    )
    .catch((err) => {
      console.error("Couldn't get all data", err)
      EventEmitter.emitToast({
        message: err.message,
        duration: 3000,
        icon: ErrorCircleIcon,
      })
      return undefined
    })

  return ObjectsToCSVString(allData)
}

export const shareCSVFile = async (data: string, filename?: string) => {
  if (!filename) {
    filename = `meter-tracker_${moment().format('YYYY-MM-DD_HH-mm')}.csv`
  }

  const fileUri = FileSystem.cacheDirectory + filename
  await FileSystem.writeAsStringAsync(fileUri, data, { encoding: FileSystem.EncodingType.UTF8 })

  await Sharing.shareAsync(fileUri, {
    mimeType: 'text/csv',
    dialogTitle: 'Export DB',
  })
}

export const readCSVFile = async () => {
  const res = await DocumentPicker.getDocumentAsync({ type: 'text/comma-separated-values' })
  if (res.type !== 'success') {
    return ''
  }

  return FileSystem.readAsStringAsync(res.uri)
}

export const databaseFromCSV = async (csv?: string, overwrite = true) => {
  if (!csv) {
    csv = await readCSVFile()
    if (!csv) {
      return
    }
  }

  EventEmitter.emitToast({
    message: t('utils:importing_data'),
    isLoading: true,
    icon: InfoCircleIcon,
  })

  const rawDataObject = CSVStringToObjects(csv)
  const importData = rawDataObject.map(unflattenObject) as Array<AllDataImport>

  const uniqueImportObjects = {
    contracts: {} as Record<string, ContractsEntity>,
    meters: {} as Record<string, MetersEntity>,
    measurements: {} as Record<string, MeasurementsEntity>,
    buildings: {} as Record<string, BuildingsEntity>,
  }

  importData.forEach((element) => {
    if (element.building?.id && element.building?.id !== 1) {
      uniqueImportObjects.buildings[element.building.id] = element.building
    }
    if (element.contract?.id) {
      uniqueImportObjects.contracts[element.contract.id] = element.contract
    }
    if (element.meter?.id) {
      uniqueImportObjects.meters[element.meter.id] = element.meter
    }
    if (element.measurement?.id) {
      uniqueImportObjects.measurements[element.measurement.id] = element.measurement
    }
  })

  if (overwrite) {
    await dropDatabase()
    await runMigrations(true)
  }

  const errorBuilding = await insertBuildingsFromEntities(
    Object.values(uniqueImportObjects.buildings)
  )
    .then(() => false as const)
    .catch((err) => err.message as string)
  const errorContracts = await insertContractsFromEntities(
    Object.values(uniqueImportObjects.contracts)
  )
    .then(() => false as const)
    .catch((err) => err.message as string)
  const errorMeters = await insertMetersFromEntities(Object.values(uniqueImportObjects.meters))
    .then(() => false as const)
    .catch((err) => err.message as string)
  const errorMeasurements = await insertMeasurementsFromEntities(
    Object.values(uniqueImportObjects.measurements)
  )
    .then(() => false as const)
    .catch((err) => err.message as string)
  const error = errorBuilding || errorMeters || errorContracts || errorMeasurements

  if (error) {
    EventEmitter.emitToast({
      message: error,
      duration: 5000,
      icon: ErrorCircleIcon,
      colors: {
        background: Colors.errorContainer,
        text: Colors.onErrorContainer,
        button: 'error',
      },
    })
    return
  }

  reloadDatabase()

  EventEmitter.emit(`data-inserted`)

  EventEmitter.emitToast({
    message: t('utils:import_finished'),
    duration: 3000,
    icon: CheckCircleIcon,
  })
}
