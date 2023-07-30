import AsyncStorage from '@react-native-async-storage/async-storage'
import { openDatabase } from 'expo-sqlite'
import { SQLResultSet, SQLStatementCallback, SQLStatementErrorCallback } from 'expo-sqlite/src/SQLite.types'
import AsyncStorageKeys from '../../constants/AsyncStorageKeys'
import ContractService from './services/ContractService'
import MeasurementService from './services/MeasurementService'
import MeterService from './services/MeterService'

export const DEFAULT_DATABASE_NAME = 'meter_tracker.db' as const
export const DATABASE_VERSION = 1
const RESET_DB = false

let db = openDatabase(DEFAULT_DATABASE_NAME)

export const reloadDatabase = () => {
  db = openDatabase(DEFAULT_DATABASE_NAME)
}

const Services = [new ContractService(), new MeterService(), new MeasurementService()]

export const RunOnDB = (
  sqlStatement: string,
  args?: (number | string | null)[],
  callback?: SQLStatementCallback,
  errorCallback?: SQLStatementErrorCallback,
) => {
  return new Promise<SQLResultSet>((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(sqlStatement, args, (tx, res) => {
        callback?.(tx, res)
        resolve(res)
      }, (tx, error) => {
        const res = errorCallback?.(tx, error)
        reject(error)
        return res ?? true
      })
    })
  })
}

export const clearDatabase = async () => {
  const promises = Services.map(async entityClass => {
    return RunOnDB(entityClass.getDeleteAllStatement())
      .then(() =>
        console.log(`Table ${ entityClass.TableName } cleared`),
      )
      .catch(err => console.error(`Table ${ entityClass.TableName } clearing failed with error "${ err }"`, err))
  })
  return Promise.all(promises)
}

export const dropDatabase = async () => {
  const promises = Services.map(async entityClass => {
    return RunOnDB(`DROP TABLE IF EXISTS ${ entityClass.TableName }`)
      .then(() =>
        console.log(`Table ${ entityClass.TableName } dropped`),
      )
      .catch(err => console.error(`Table ${ entityClass.TableName } dropping failed with error "${ err }"`, err))
  })
  return Promise.all(promises)
}

export async function setupDatabase() {
  const currentDatabaseVersion = await AsyncStorage.getItem(AsyncStorageKeys.DATABASE_VERSION)
    .then(value => RESET_DB ? 0 : parseInt(value ?? '0'))

  if (currentDatabaseVersion === DATABASE_VERSION) {
    return
  }

  if (RESET_DB) {
    await dropDatabase()
  }

  for (let migrateVersion = currentDatabaseVersion; migrateVersion < DATABASE_VERSION; migrateVersion++) {
    const promises = Services.map(async entityClass => {
      return RunOnDB(entityClass.getMigrationStatement(migrateVersion, migrateVersion + 1))
        .then(() =>
          console.log(
            `Table ${ entityClass.TableName } migrated from ${ migrateVersion } to ${ migrateVersion + 1 }`),
        )
        .catch(err => console.error(`Table ${ entityClass.TableName } migration failed with error "${ err }"`, err))
    })
    await Promise.all(promises)
  }

  await AsyncStorage.setItem('databaseVersion', String(DATABASE_VERSION))
}

export default db
