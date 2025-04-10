import { db, Schema } from '@/database/db'

export async function clearDatabase() {
  await db.delete(Schema.building).execute()
  await db.delete(Schema.contract).execute()
  await db.delete(Schema.contractRevision).execute()
  await db.delete(Schema.meter).execute()
  await db.delete(Schema.meterReset).execute()
  await db.delete(Schema.reading).execute()
}