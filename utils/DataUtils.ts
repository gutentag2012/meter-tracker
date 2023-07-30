import * as DocumentPicker from 'expo-document-picker'
import * as FileSystem from 'expo-file-system'
import * as Sharing from 'expo-sharing'
import moment from 'moment'
import { Colors } from 'react-native-ui-lib'
import { CheckCircleIcon } from '../components/icons/CheckCircleIcon'
import { ErrorCircleIcon } from '../components/icons/ErrorCircleIcon'
import { InfoCircleIcon } from '../components/icons/InfoCircleIcon'
import { clearDatabase, reloadDatabase } from '../services/database'
import GenericRepository from '../services/database/GenericRepository'
import ContractService from '../services/database/services/ContractService'
import MeasurementService from '../services/database/services/MeasurementService'
import MeterService from '../services/database/services/MeterService'
import EventEmitter from '../services/events'
import { t } from '../services/i18n'

export const databaseToCSVString = async () => {
  // Could be used to export everything in separate files
  // db.transaction(async tx => {
  //   const [meters, contracts, measurements] = await Promise.all(
  //     [METER_TABLE_NAME, CONTRACT_TABLE_NAME, MEASUREMENT_TABLE_NAME].map(table => {
  //       const statement = `SELECT * FROM ${table}`
  //       return new Promise((resolve, reject) => {
  //         tx.executeSql(
  //           statement,
  //           [],
  //           (_, { rows }) => {
  //             resolve(rows._array)
  //           },
  //           (_, error) => {
  //             console.error('ERROR WHILE EXPORTING DB', error)
  //             resolve([])
  //             return true
  //           },
  //         )
  //       })
  //     }))
  //
  //   console.log('meters')
  //   console.log(meters)
  //   console.log('contracts')
  //   console.log(contracts)
  //   console.log('measurements')
  //   console.log(measurements)
  // })

  const service = new MeasurementService()
  // const meterService = new MeterService()
  // const contractService = new ContractService()
  const repo = new GenericRepository(service)
  // const meterRepo = new GenericRepository(meterService)
  // const contractRepo = new GenericRepository(contractService)

  const allMeasurements = await repo.getAllData()
  // const allMeters = await meterRepo.getAllData()
  // const allContracts = await contractRepo.getAllData()

  let csvHeader = service.getCSVHeader(true)
  const csvRows = allMeasurements.map(measurement => {
    return measurement.getCSVValues(true)
  })
  return [csvHeader, ...csvRows].join('\n')
}

export const shareCSVFile = async (data: string, filename?: string) => {
  if (!filename) {
    filename = `meter-tracker_${ moment()
      .format('YYYY-MM-DD_HH-mm') }.csv`
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
  }
  EventEmitter.emitToast({
    message: t('utils:importing_data'),
    isLoading: true,
    icon: InfoCircleIcon,
  })

  const measurementService = new MeasurementService()
  const measurementRepo = new GenericRepository(measurementService)
  const contractService = new ContractService()
  const contractRepo = new GenericRepository(contractService)
  const meterService = new MeterService()
  const meterRepo = new GenericRepository(meterService)

  const [header, ...rows] = csv.split('\n')
  const headerArray = header.split(',')

  const rowsAsObjects = rows.map(row => {
    const values = row.split(',')
    const paresObject = values.reduce((acc, value, index) => {

      try {
        acc[headerArray[index]] = !value ? undefined : JSON.parse(value)
      } catch (ignored) {
        // Catch any possible parsing error
        acc[headerArray[index]] = value
      }

      return acc
    }, {} as Record<string, any>)

    return measurementService.fromJSON(paresObject)
  })

  if (overwrite) {
    await clearDatabase()
  }

  const uniqueEntities = {
    contracts: {} as Record<string, any>,
    meters: {} as Record<string, any>,
    measurements: {} as Record<string, any>,
  }

  for (const measurement of rowsAsObjects) {
    if (measurement.meter?.contract?.id) {
      uniqueEntities.contracts[measurement.meter.contract.id] = measurement.meter.contract
    }
    if (measurement.meter?.id) {
      uniqueEntities.meters[measurement.meter.id] = measurement.meter
    }
    if (measurement.id) {
      uniqueEntities.measurements[measurement.id] = measurement
    }
  }

  const promises = []
  for (const contract of Object.values(uniqueEntities.contracts)) {
    promises.push(contractRepo.insertData(contract, true, false))
  }
  for (const meter of Object.values(uniqueEntities.meters)) {
    promises.push(meterRepo.insertData(meter, true, false))
  }
  for (const measurement of Object.values(uniqueEntities.measurements)) {
    promises.push(measurementRepo.insertData(measurement, true, false))
  }

  const [success, error] = await Promise.all(promises)
    .then(() => [true])
    .catch(err => [false, err])

  if (!success) {
    EventEmitter.emitToast({
      message: error?.message ?? error,
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
