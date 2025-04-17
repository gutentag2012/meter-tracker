import { db } from '@/database/db'
import { contract, meter, meterReset, MeterResetInsert, meterType, reading, unit } from '@/database/schema'
import { desc, eq, getTableName, lte, sql } from 'drizzle-orm'
import { useState } from 'react'
import { addDatabaseChangeListener } from 'expo-sqlite'
import { useSignalEffect } from '@preact/signals-react'
import { activeBuilding } from '@/modules/buildings/buildings.signals'

export async function getAllMetersForBuilding(buildingId: number) {
  const rankedReadingsPerMeter = db.$with('rankedReadingsPerMeter').as(
    db
      .select({
        meterId: meter.id,
        readingValue: reading.value,
        readingDate: reading.timestamp,
        row: sql<number>`ROW_NUMBER() OVER (PARTITION BY ${meter.id} ORDER BY ${reading.timestamp} DESC)`.as(
          'row',
        ),
      })
      .from(meter)
      .leftJoin(reading, eq(reading.meterId, meter.id))
      .where(eq(meter.buildingId, buildingId)),
  )
  const readingDifferences = db.$with('readingDifferences').as(
    db
      .select({
        meterId: rankedReadingsPerMeter.meterId,
        lastDifferencePerDay:
          sql<number>`(MAX(CASE WHEN ${rankedReadingsPerMeter.row} = 1 THEN ${rankedReadingsPerMeter.readingValue} END)
                                       - MAX(CASE WHEN ${rankedReadingsPerMeter.row} = 2 THEN ${rankedReadingsPerMeter.readingValue} END))
                                       / NULLIF((MAX(CASE WHEN ${rankedReadingsPerMeter.row} = 1 THEN ${rankedReadingsPerMeter.readingDate} END)
                                       - MAX(CASE WHEN ${rankedReadingsPerMeter.row} = 2 THEN ${rankedReadingsPerMeter.readingDate} END)) / 86400.0, 0)`.as(
            'last_difference_per_day',
          ),
        secondDifferencePerDay:
          sql<number>`(MAX(CASE WHEN ${rankedReadingsPerMeter.row} = 2 THEN ${rankedReadingsPerMeter.readingValue} END)
                                       - MAX(CASE WHEN ${rankedReadingsPerMeter.row} = 3 THEN ${rankedReadingsPerMeter.readingValue} END))
                                       / NULLIF((MAX(CASE WHEN ${rankedReadingsPerMeter.row} = 2 THEN ${rankedReadingsPerMeter.readingDate} END)
                                       - MAX(CASE WHEN ${rankedReadingsPerMeter.row} = 3 THEN ${rankedReadingsPerMeter.readingDate} END)) / 86400.0, 0)`.as(
            'second_difference_per_day',
          ),
        lastReading:
          sql<number>`MAX(CASE WHEN ${rankedReadingsPerMeter.row} = 1 THEN ${rankedReadingsPerMeter.readingValue} END)`.as(
            'lastReading',
          ),
        lastReadingDate:
          sql<number>`MAX(CASE WHEN ${rankedReadingsPerMeter.row} = 1 THEN ${rankedReadingsPerMeter.readingDate} END)`
            .mapWith(reading.timestamp)
            .as('lastReadingDate'),
      })
      .from(rankedReadingsPerMeter)
      .where(lte(rankedReadingsPerMeter.row, 3))
      .groupBy(rankedReadingsPerMeter.meterId),
  )
  return db
    .with(rankedReadingsPerMeter, readingDifferences)
    .select({
      meterId: readingDifferences.meterId,
      meterName: meter.name,
      meterPrecision: meter.precision,
      identifier: meter.identifier,
      meterUnit: unit.abbreviation,
      lastReading: readingDifferences.lastReading,
      lastReadingDate: readingDifferences.lastReadingDate,
      lastDifferencePerDay: readingDifferences.lastDifferencePerDay,
      secondDifferencePerDay: readingDifferences.secondDifferencePerDay,
      percentileChange: sql<number>`(
           (${readingDifferences.lastDifferencePerDay} - ${readingDifferences.secondDifferencePerDay})
               / NULLIF(ABS(${readingDifferences.secondDifferencePerDay}), 0)
           ) * 100`.as('percentile_change'),
    })
    .from(readingDifferences)
    .leftJoin(meter, eq(readingDifferences.meterId, meter.id))
    .leftJoin(unit, eq(meter.unitId, unit.id))
    .orderBy(meter.sortOrder, desc(meter.id))
}

export async function getMeterById(meterId: number) {
  return db.query.meter.findFirst({ where: eq(meter.id, meterId) })
}

export async function getMeterResetsById(meterId: number) {
  return db.query.meterReset.findMany({ where: eq(meterReset.meterId, meterId), orderBy: desc(meterReset.timestamp) })
}

export async function deleteMeterReset(meterResetId: number) {
  return db.delete(meterReset).where(eq(meterReset.id, meterResetId)).execute()
}

export function getAllMeterTypes() {
  return db.query.meterType.findMany()
}

export function updateMeterOrders(newOrder: Record<number, number>) {
  return db.transaction(async (tx) => {
    for (const [meterId, sortOrder] of Object.entries(newOrder)) {
      await tx
        .update(meter)
        .set({ sortOrder })
        .where(eq(meter.id, meterId as unknown as number))
    }
  })
}

export function deleteMeter(meterId: number) {
  return db.delete(meter).where(eq(meter.id, meterId)).execute()
}

export async function resetMeterValue(meterId: number) {
  const lastReadings = await db
    .select({ value: reading.value })
    .from(reading)
    .where(
      eq(
        reading.timestamp,
        db
          .select({ maxTimestamp: sql`MAX(${reading.timestamp})` })
          .from(reading)
          .where(eq(reading.meterId, meterId)),
      ),
    )
    .catch((err) => console.error(err))
  if (!lastReadings?.length) {
    return
  }

  const [lastReading] = lastReadings
  await db.insert(meterReset).values({
    meterId,
    timestamp: new Date(),
    value: lastReading.value
  })
}

export async function createMeter(values: typeof meter.$inferInsert) {
  return db.insert(meter).values(values).execute()
}

export async function updateMeter(
  meterId: number,
  values: Partial<typeof meter.$inferInsert>,
  resets: { id: number; timestamp: Date; value: number }[],
) {
  for (const { id, ...reset } of resets) {
    await db
      .update(meterReset)
      .set(reset)
      .where(eq(meterReset.id, id))
      .execute()
  }
  return db.update(meter).set(values).where(eq(meter.id, meterId)).execute()
}

export function useMetersForBuilding() {
  const [data, setData] = useState<
    Awaited<ReturnType<typeof getAllMetersForBuilding>>
  >([])
  const [error, setError] = useState<string | null>(null)

  useSignalEffect(() => {
    try {
    getAllMetersForBuilding(activeBuilding.value)
      .then((res) => {
        setData(res)
        setError(null)
      })
      .catch(setError)

    const listener = addDatabaseChangeListener((change) => {
      if (
        change.tableName !== getTableName(reading) &&
        change.tableName !== getTableName(meter) &&
        change.tableName !== getTableName(contract)
      ) {
        return
      }
      getAllMetersForBuilding(activeBuilding.value)
        .then((res) => {
          setData(res)
          setError(null)
        })
        .catch(setError)
    })

    return () => {
      listener.remove()
    }

    } catch (e) {
      console.error('Error in useMetersForBuilding', e)
      setError('Error loading meters')
    }
  })
  return [data, error] as const
}

export function useAllMeterTypes() {
  const [data, setData] = useState<
    Awaited<ReturnType<typeof getAllMeterTypes>>
  >([])
  const [error, setError] = useState<string | null>(null)

  useSignalEffect(() => {
    getAllMeterTypes()
      .then((res) => {
        setData(res)
        setError(null)
      })
      .catch(setError)

    const listener = addDatabaseChangeListener((change) => {
      if (change.tableName !== getTableName(meterType)) {
        return
      }
      getAllMeterTypes()
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

export function useMeterResetsById(meterId?: number) {
  const [data, setData] = useState<
    Awaited<ReturnType<typeof getMeterResetsById>>
  >([])
  const [error, setError] = useState<string | null>(null)

  useSignalEffect(() => {
    if(!meterId) {
      return
    }
    getMeterResetsById(meterId)
      .then((res) => {
        setData(res)
        setError(null)
      })
      .catch(setError)

    const listener = addDatabaseChangeListener((change) => {
      if (change.tableName !== getTableName(meterReset)) {
        return
      }
      getMeterResetsById(meterId)
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

export function useMeterById(meterId: number) {
  const [data, setData] = useState<Awaited<ReturnType<typeof getMeterById>>>()
  const [error, setError] = useState<string | null>(null)

  useSignalEffect(() => {
    getMeterById(meterId)
      .then((res) => {
        setData(res)
        setError(null)
      })
      .catch(setError)

    const listener = addDatabaseChangeListener((change) => {
      if (
        change.tableName !== getTableName(meterType) &&
        change.tableName !== getTableName(meter)
      ) {
        return
      }
      getMeterById(meterId)
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
