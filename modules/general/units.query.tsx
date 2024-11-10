import { db } from '@/database/db'
import { unit } from '@/database/schema'
import { useState } from 'react'
import { useSignalEffect } from '@preact/signals-react'
import { addDatabaseChangeListener } from 'expo-sqlite'
import { getTableName } from 'drizzle-orm'

export async function getAllUnits() {
  return db.select().from(unit)
}

export function useAllUnits() {
  const [data, setData] = useState<Awaited<ReturnType<typeof getAllUnits>>>([])
  const [error, setError] = useState<string | null>(null)

  useSignalEffect(() => {
    getAllUnits()
      .then((res) => {
        setData(res)
        setError(null)
      })
      .catch(setError)

    const listener = addDatabaseChangeListener((change) => {
      if (change.tableName !== getTableName(unit)) {
        return
      }
      getAllUnits()
        .then((res) => {
          setData(res)
          setError(null)
        })
        .catch(setError)
    })

    return () => {
      listener.remove()
    }
  })
  return [data, error] as const
}
