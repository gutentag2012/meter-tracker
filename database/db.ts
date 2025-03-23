import { DEFAULT_DATABASE_NAME } from '@/database/constants'
import migrations from '@/database/drizzle/migrations'
import * as Schema from '@/database/schema'
import { drizzle } from 'drizzle-orm/expo-sqlite'
import { migrate } from 'drizzle-orm/expo-sqlite/migrator'
import { openDatabaseSync } from 'expo-sqlite'
import { getTableName, sql } from 'drizzle-orm'
import { isDatabaseMigrated } from './db.signals'

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
    for (const [table, tableEntity] of Object.entries(Schema)) {
      console.log('Dropping table', table)
      // @ts-expect-error tableEntity is the correct value
      db.run(sql.raw(`DROP TABLE IF EXISTS ${getTableName(tableEntity)}`))
    }
    console.log('Resetting database migrations')
    // noinspection SqlResolve
    db.run(sql`DELETE FROM __drizzle_migrations`)
    console.log('Running migrations')
    await migrate(db, migrations)
      .then(() => {
        isDatabaseMigrated.value = true
      })
      .catch((err) => console.log('Error', err))
    SHOULD_RESET_DATABASE = false
  })()
} else {
  migrate(db, migrations)
    .then(() => {
      isDatabaseMigrated.value = true
    })
    .catch((err) => console.log('Error', err))
}

export { db, Schema }
