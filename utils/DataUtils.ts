import * as DocumentPicker from 'expo-document-picker'
import * as FileSystem from 'expo-file-system'
import * as Sharing from 'expo-sharing'
import db from '../services/database'
import { CONTRACT_TABLE_NAME, MEASUREMENT_TABLE_NAME, METER_TABLE_NAME } from '../services/database/entities'
import GenericRepository from '../services/database/GenericRepository'
import ContractService from '../services/database/services/ContractService'
import MeasurementService from '../services/database/services/MeasurementService'
import MeterService from '../services/database/services/MeterService'

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
  const repo = new GenericRepository(service)

  const allMeasurements = await repo.getAllData()
  let csvHeader = service.getCSVHeader(true)
  const csvRows = allMeasurements.map(measurement => {
    return measurement.getCSVValues(true)
  })
  return [csvHeader, ...csvRows].join('\n')
}

export const shareCSVFile = async (data: string, filename = 'db.csv') => {
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
      acc[headerArray[index]] = !value ? undefined : JSON.parse(value)
      return acc
    }, {} as Record<string, any>)
    return measurementService.fromJSON(paresObject)
  })

  if (overwrite) {
    db.transaction(async tx => {
      await Promise.all(
        [METER_TABLE_NAME, CONTRACT_TABLE_NAME, MEASUREMENT_TABLE_NAME].map(table => {
          const statement = `DELETE FROM ${table} WHERE 1 = 1`
          return new Promise((resolve, reject) => {
            tx.executeSql(
              statement,
              [],
              (_, { rows }) => {
                resolve(rows._array)
              },
              (_, error) => {
                console.error('ERROR WHILE EXPORTING DB', error)
                resolve([])
                return true
              },
            )
          })
        }))
    })
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
    promises.push(contractRepo.insertData(contract, true))
  }
  for (const meter of Object.values(uniqueEntities.meters)) {
    promises.push(meterRepo.insertData(meter, true))
  }
  for (const measurement of Object.values(uniqueEntities.measurements)) {
    promises.push(measurementRepo.insertData(measurement, true))
  }

  await Promise.all(promises)
  console.log('Inserted all data')
}
