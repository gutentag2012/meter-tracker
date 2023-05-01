import AsyncStorage from '@react-native-async-storage/async-storage'
import { openDatabase } from 'expo-sqlite'
import ContractService from './services/ContractService'
import MeasurementService from './services/MeasurementService'
import MeterService from './services/MeterService'

export const DEFAULT_DATABASE_NAME = 'meter_tracker.db' as const
export const DATABASE_VERSION = 1
const DROP_TABLES = true

const db = openDatabase(DEFAULT_DATABASE_NAME)

export async function setupDatabase() {
  const currentDatabaseVersion = await AsyncStorage.getItem('databaseVersion')
    .then(value => parseInt(value ?? '0'))

  if (currentDatabaseVersion === DATABASE_VERSION) {
    return
  }

  const Services = [new ContractService(), new MeterService(), new MeasurementService()]

  if (DROP_TABLES) {
    db.transaction(tx => {
      Services.forEach(entityClass => {
        tx.executeSql(`DROP TABLE IF EXISTS ${ entityClass.TableName }`)
      })
    })
  }

  db.transaction(tx => {
    Services.forEach(entityClass => {
      tx.executeSql(
        entityClass.getMigrationStatement(currentDatabaseVersion, DATABASE_VERSION),
        [],
        () => console.log(
          `Table ${ entityClass.TableName } migrated from ${ currentDatabaseVersion } to ${ DATABASE_VERSION }`),
        (_, error) => {
          console.error(`Table ${ entityClass.TableName } migration failed with error "${ error }"`, error)
          return true
        },
      )
    })

    AsyncStorage.setItem('databaseVersion', String(DATABASE_VERSION))
  })
}

export default db
