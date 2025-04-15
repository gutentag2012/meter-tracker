import { db } from '@/database/db'
import { building, BuildingInsert } from '@/database/schema'
import { count, eq, getTableName } from 'drizzle-orm'
import { activeBuilding } from '@/modules/buildings/buildings.signals'
import { useEffect, useState } from 'react'
import { useSignalEffect } from '@preact/signals-react'
import { addDatabaseChangeListener } from 'expo-sqlite'

export async function createBuilding(values: BuildingInsert) {
  await db.insert(building).values(values)
}

export async function updateBuilding(
  buildingId: number,
  values: Partial<BuildingInsert>,
) {
  await db
    .update(building)
    .set(values)
    .where(eq(building.id, buildingId))
}

export async function getBuilding(buildingId: number) {
  const res = await db
    .select()
    .from(building)
    .where(eq(building.id, buildingId))
    .limit(1)
  return res[0]
}

export async function deleteBuilding(buildingId: number) {
  const wasDefault = await db.select().from(building).where(eq(building.id, buildingId)).then(res => res[0].isDefault)
  await db.delete(building).where(eq(building.id, buildingId))
  if(!wasDefault) return
  const firstBuildingId = await db.select({id: building.id}).from(building).limit(1).then(res => res[0].id)
  if(!firstBuildingId) return
  activeBuilding.value = firstBuildingId
  await db
    .update(building)
    .set({ isDefault: true })
    .where(eq(building.id, firstBuildingId))
}

export async function countBuildings() {
  return db.select({count: count(building.id)}).from(building).then(res => res[0].count)
}

export async function getAllBuildings() {
  return db.select().from(building)
}

export async function markBuildingAsDefault(buildingId: number) {
  await db
    .update(building)
    .set({ isDefault: false })
    .where(eq(building.isDefault, true))
  await db
    .update(building)
    .set({ isDefault: true })
    .where(eq(building.id, buildingId))
}

export function useAllBuildings() {
  const [data, setData] = useState<Awaited<
    ReturnType<typeof getAllBuildings>
  > | null>(null)
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
  const [data, setData] = useState<Awaited<
    ReturnType<typeof getBuilding>
  > | null>(null)
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

export function useBuildingById(buildingId: number) {
  const [data, setData] = useState<Awaited<
    ReturnType<typeof getBuilding>
  > | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    getBuilding(buildingId)
      .then((res) => {
        setData(res)
        setError(null)
      })
      .catch(setError)
  }, [buildingId])

  return [data, error] as const
}

export function useBuildingCount() {
  const [data, setData] = useState<Awaited<
    ReturnType<typeof countBuildings>
  > | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    countBuildings()
      .then((res) => {
        setData(res)
        setError(null)
      })
      .catch(setError)
  }, [])

  return [data, error] as const
}
