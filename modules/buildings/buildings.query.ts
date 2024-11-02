import { db } from '@/database/db'
import { building } from '@/database/schema'
import { eq, getTableName } from 'drizzle-orm'
import { activeBuilding } from '@/modules/buildings/buildings.signals'
import { useEffect, useState } from 'react'
import { useSignalEffect } from '@preact/signals-react'
import { addDatabaseChangeListener } from 'expo-sqlite'

export async function getBuilding(buildingId: number) {
  const res = await db.select().from(building).where(eq(building.id, buildingId)).limit(1)
  return res[0]
}

export async function getAllBuildings() {
  return db.select().from(building)
}

export async function markBuildingAsDefault(buildingId: number) {
  await db.update(building).set({ isDefault: false }).where(eq(building.isDefault, true))
  await db.update(building).set({ isDefault: true }).where(eq(building.id, buildingId))
}

export function useAllBuildings() {
  const [data, setData] = useState<Awaited<ReturnType<typeof getAllBuildings>> | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    getAllBuildings()
      .then((res) => {
        setData(res)
        setError(null)
      })
      .catch(setError)

    const listener = addDatabaseChangeListener((change) => {
      if (change.tableName !== getTableName(building)) {
        return
      }
      getAllBuildings()
        .then((res) => {
          setData(res)
          setError(null)
        })
        .catch(setError)
    })

    return () => {
      listener.remove()
    }
  }, [])

  return [data, error] as const
}

export function useActiveBuilding() {
  const [data, setData] = useState<Awaited<ReturnType<typeof getBuilding>> | null>(null)
  const [error, setError] = useState<string | null>(null)

  useSignalEffect(() => {
    getBuilding(activeBuilding.value)
      .then((res) => {
        setData(res)
        setError(null)
      })
      .catch(setError)
  })

  return [data, error] as const
}
