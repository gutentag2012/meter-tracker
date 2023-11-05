import AsyncStorage from '@react-native-async-storage/async-storage'
import { openDatabase } from 'expo-sqlite'
import {
  type SQLResultSet,
  type SQLStatementCallback,
  type SQLStatementErrorCallback,
} from 'expo-sqlite/src/SQLite.types'
import AsyncStorageKeys from '../../constants/AsyncStorageKeys'
import ContractService from './services/ContractService'
import MeasurementService from './services/MeasurementService'
import MeterService from './services/MeterService'
import BuildingService from './services/BuildingService'

// TODO Use arguments for queries instead of string interpolation

export const DEFAULT_DATABASE_NAME = 'meter_tracker.db' as const
export const DATABASE_VERSION = 5
const RESET_DB = false

let db = openDatabase(DEFAULT_DATABASE_NAME)
const setForeingKeys = (value?: 'ON' | 'OFF') => {
  return new Promise((resolve) => {
    db.exec(
      [
        {
          sql: value ? `PRAGMA foreign_keys=${value};` : 'PRAGMA foreign_keys',
          args: [],
        },
      ],
      false,
      (err, res) => {
        if (!value) {
          console.log('Foreign keys set to:', value, '__', err, res?.[0])
        }
        resolve(undefined)
      }
    )
  })
}
setForeingKeys('ON')

export const reloadDatabase = () => {
  db = openDatabase(DEFAULT_DATABASE_NAME)
  setForeingKeys('ON')
}

const Services = [
  new BuildingService(),
  new ContractService(),
  new MeterService(),
  new MeasurementService(),
]
const reversedServices = [...Services].reverse()

export const RunOnDB = (
  sqlStatement: string,
  args?: (number | string | null)[],
  callback?: SQLStatementCallback,
  errorCallback?: SQLStatementErrorCallback
) => {
  return new Promise<SQLResultSet>((resolve, reject) => {
    db.transaction((tx) => {
      tx.executeSql(
        sqlStatement,
        args,
        (tx, res) => {
          callback?.(tx, res)
          resolve(res)
        },
        (tx, error) => {
          const res = errorCallback?.(tx, error)
          reject(error)
          return res ?? true
        }
      )
    })
  })
}

export const clearDatabase = async () => {
  const promises = reversedServices.map(async (entityClass) => {
    return RunOnDB(entityClass.getDeleteAllStatement())
      .then(() => console.log(`Table ${entityClass.TableName} cleared`))
      .catch((err) =>
        console.error(`Table ${entityClass.TableName} clearing failed with error "${err}"`, err)
      )
  })
  return Promise.all(promises)
}

export const dropDatabase = async () => {
  const promises = reversedServices.map(async (entityClass) => {
    return RunOnDB(`DROP TABLE IF EXISTS ${entityClass.TableName}`)
      .then(() => console.log(`Table ${entityClass.TableName} dropped`))
      .catch((err) =>
        console.error(`Table ${entityClass.TableName} dropping failed with error "${err}"`, err)
      )
  })
  return Promise.all(promises)
}

export async function setupDatabase() {
  const currentDatabaseVersion = await AsyncStorage.getItem(AsyncStorageKeys.DATABASE_VERSION).then(
    (value) => (RESET_DB ? 0 : parseInt(value ?? '0'))
  )

  if (currentDatabaseVersion === DATABASE_VERSION) {
    return
  }

  if (RESET_DB) {
    await dropDatabase()
  }

  await setForeingKeys('OFF')
  await setForeingKeys()

  for (
    let migrateVersion = currentDatabaseVersion;
    migrateVersion < DATABASE_VERSION;
    migrateVersion++
  ) {
    const promises = Services.map(async (entityClass) => {
      const migrationStatements = entityClass.getMigrationStatements(
        migrateVersion,
        migrateVersion + 1
      )

      if (!migrationStatements.length) return

      return Promise.all(
        migrationStatements.map((migrationStatement) =>
          RunOnDB(migrationStatement).catch((err) =>
            console.error(
              `Table ${entityClass.TableName} migration failed with error "${err}"`,
              err
            )
          )
        )
      ).then(() =>
        console.log(
          `Table ${entityClass.TableName} migrated from ${migrateVersion} to ${migrateVersion + 1}`
        )
      )
    })
    await Promise.all(promises)
  }

  await setForeingKeys('ON')

  await AsyncStorage.setItem('databaseVersion', String(DATABASE_VERSION))
}

export default db
