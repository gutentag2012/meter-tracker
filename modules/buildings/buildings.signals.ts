import { signal } from '@preact/signals-core'
import { db } from '@/database/db'
import { isDatabaseMigrated } from '@/database/db.signals'
import { building } from '@/database/schema'
import { eq } from 'drizzle-orm'
import { effect } from '@preact/signals-react'

export const activeBuilding = signal(1)

effect(() => {
  if (!isDatabaseMigrated.value) {
    return
  }
  db.select({ id: building.id })
    .from(building)
    .where(eq(building.isDefault, true))
    .limit(1)
    .then((res) => {
      activeBuilding.value = res[0].id
    })
})
