import AsyncStorage from '@react-native-async-storage/async-storage'
import { openDatabase } from 'expo-sqlite'
import Contract from './entities/contract'
import Measurement from './entities/measurement'
import Meter from './entities/meter'

export const DEFAULT_DATABASE_NAME = 'meter_tracker.db' as const
export const DATABASE_VERSION = 1
const DROP_TABLES = true

const db = openDatabase(DEFAULT_DATABASE_NAME)

export async function setupDatabase() {
  const currentDatabaseVersion = await AsyncStorage.getItem('databaseVersion')
    .then(value => /*+value || */0)
  if (currentDatabaseVersion === DATABASE_VERSION) {
    return
  }

  const EntityClasses = [Contract, Meter, Measurement]

  if (DROP_TABLES) {
    db.transaction(tx => {
      EntityClasses.forEach(entityClass => {
        tx.executeSql(`DROP TABLE IF EXISTS ${ entityClass.TABLE_NAME }`)
      })
    })
  }

  db.transaction(tx => {
    EntityClasses.forEach(entityClass => {
      tx.executeSql(
        entityClass.getMigrationStatement(currentDatabaseVersion, DATABASE_VERSION),
        [],
        () => console.log(
          `Table ${ entityClass.TABLE_NAME } migrated from ${ currentDatabaseVersion } to ${ DATABASE_VERSION }`),
        (_, error) => {
          console.log(`Table ${ entityClass.TABLE_NAME } migration failed with error "${ error }"`, error)
          return true
        },
      )
    })

    AsyncStorage.setItem('databaseVersion', String(DATABASE_VERSION))
  })
}

export default db
