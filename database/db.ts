import { DEFAULT_DATABASE_NAME } from '@/database/constants'
import migrations from '@/database/drizzle/migrations'
import * as Schema from '@/database/schema'
import { drizzle } from 'drizzle-orm/expo-sqlite'
import { migrate } from 'drizzle-orm/expo-sqlite/migrator'
import { openDatabaseSync } from 'expo-sqlite'
import { getTableName, sql } from 'drizzle-orm'
import { isDatabaseMigrated } from './db.signals'
import { resetDatabase } from '@/modules/general/general.query'

// TODO Migrate from the old database to the new database

const expoDatabase = openDatabaseSync(DEFAULT_DATABASE_NAME, {
  enableChangeListener: true,
  finalizeUnusedStatementsBeforeClosing: true,
  useNewConnection: true,
})

const db = drizzle<typeof Schema>(expoDatabase, {
  logger: false,
  schema: Schema,
})

let SHOULD_RESET_DATABASE = false
isDatabaseMigrated.value = false
if (SHOULD_RESET_DATABASE) {
  ;(async function () {
    await resetDatabase()
    SHOULD_RESET_DATABASE = false
  })()
} else {
  console.log('Running migrations', migrations)
  migrate(db, migrations)
    .then(() => {
        console.log('Database reset and migrated')
      isDatabaseMigrated.value = true
    })
    .catch((err) => console.log('Error', err))
}

export { db, Schema }
