import { BUILDING_TABLE_NAME, EVENT_INVALIDATE_BUILDINGS } from '@/buildings/buildings.constants'
import { CONTRACT_TABLE_NAME, EVENT_INVALIDATE_CONTRACTS } from '@/contracts/contracts.constants'
import migrations from '@/database/migrations'
import EventEmitter from '@/events'
import {
  EVENT_INVALIDATE_MEASUREMENTS,
  MEASUREMENT_TABLE_NAME,
} from '@/measurements/measurements.constants'
import { EVENT_INVALIDATE_METERS, METER_TABLE_NAME } from '@/meters/meters.constants'
import { currentlyLoadedResources, DATABASE_RESOURCE } from '@utils/AppResources'
import { getAsyncValue, setAsyncValue } from '@utils/AsyncStorageUtils'
import { openDatabase, type SQLTransaction } from 'expo-sqlite'
import { type SQLResultSet } from 'expo-sqlite/src/SQLite.types'
import { DATABASE_VERSION, DEFAULT_DATABASE_NAME, RESET_DB } from './constants'

export let db = openDatabase(DEFAULT_DATABASE_NAME)

export const RunOnDB = (sqlStatement: string, args?: (number | string | null)[]) => {
  return new Promise<SQLResultSet>((resolve, reject) => {
    db.transaction((tx) => {
      tx.executeSql(
        sqlStatement,
        args,
        (_, res) => {
          resolve(res)
        },
        (_, error) => {
          reject(error)
          return true
        }
      )
    })
  })
}
export const RunOnDBInTransaction = (executors: (tx: SQLTransaction) => void) => {
  return new Promise<void>((resolve, reject) => {
    db.transaction(
      executors,
      (error) => {
        reject(error)
        return true
      },
      () => {
        resolve()
      }
    )
  })
}

export const setForeignKeys = (value?: 'ON' | 'OFF') => {
  return new Promise((resolve) => {
    db.exec(
      [
        {
          sql: value ? `PRAGMA foreign_keys=${value};` : 'PRAGMA foreign_keys',
          args: [],
        },
      ],
      false,
      () => {
        resolve(undefined)
      }
    )
  })
}

export const reloadDatabase = () => {
  db = openDatabase(DEFAULT_DATABASE_NAME)

  EventEmitter.emit(EVENT_INVALIDATE_METERS)
  EventEmitter.emit(EVENT_INVALIDATE_CONTRACTS)
  EventEmitter.emit(EVENT_INVALIDATE_BUILDINGS)
  EventEmitter.emit(EVENT_INVALIDATE_MEASUREMENTS)
}

const TABLES = [MEASUREMENT_TABLE_NAME, METER_TABLE_NAME, CONTRACT_TABLE_NAME, BUILDING_TABLE_NAME]
export const dropDatabase = async () => {
  await setForeignKeys('OFF')

  const promises = TABLES.map(async (table) => {
    return RunOnDB(`DROP TABLE IF EXISTS ${table}`)
      .then(() => console.log(`Table ${table} dropped`))
      .catch((err) => console.error(`Table ${table} dropping failed with error "${err}"`, err))
  })
  const res = await Promise.all(promises)
  await setForeignKeys('ON')
  return res
}

export const runMigrations = async (force = RESET_DB) => {
  const currentDatabaseVersion = force ? 0 : await getAsyncValue('databaseVersion', 0)

  if (force) {
    await dropDatabase()
  }

  await setForeignKeys('OFF')

  for (
    let migrateVersion = currentDatabaseVersion;
    migrateVersion < DATABASE_VERSION;
    migrateVersion++
  ) {
    await RunOnDBInTransaction((tx: SQLTransaction) => {
      for (const migrationStatement of migrations[migrateVersion]) {
        tx.executeSql(migrationStatement, undefined, undefined, (_, error) => {
          console.error(
            `Migration failed with error "${error}" for migration "${migrationStatement}"`
          )
          return true
        })
      }
    })

    console.log(`Migrated from ${migrateVersion} to ${migrateVersion + 1}`)
  }

  await setForeignKeys('ON')

  await setAsyncValue('databaseVersion', DATABASE_VERSION)
}

runMigrations()
  .then(() => {
    console.log('Finished migrations')
    currentlyLoadedResources.value |= DATABASE_RESOURCE
  })
  .catch((err) => console.error('Failed migrations', err))
