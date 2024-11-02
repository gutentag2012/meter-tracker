import { DEFAULT_DATABASE_NAME } from '@/database/constants'
import migrations from '@/database/drizzle/migrations'
import * as Schema from '@/database/schema'
import { drizzle } from 'drizzle-orm/expo-sqlite'
import { migrate } from 'drizzle-orm/expo-sqlite/migrator'
import { openDatabaseSync } from 'expo-sqlite'
import { isDatabaseMigrated } from '@/modules/general/setup.signals'

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

migrate(db, migrations)
  .then(() => {
    isDatabaseMigrated.value = true
  })
  .catch((err) => console.log('Error', err))

export { db }
