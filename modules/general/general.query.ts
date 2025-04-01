import * as Schema from '@/database/schema'
import { getTableName, sql } from 'drizzle-orm'
import { migrate } from 'drizzle-orm/expo-sqlite/migrator'
import migrations from '@/database/drizzle/migrations'
import { isDatabaseMigrated } from '@/database/db.signals'
import { db } from '@/database/db'

export async function resetDatabase() {
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
      console.log('Database reset and migrated')
      isDatabaseMigrated.value = true
    })
    .catch((err) => console.log('Error', err))
}