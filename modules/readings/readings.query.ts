import { db } from '@/database/db'
import { meter, reading, unit } from '@/database/schema'
import { and, desc, eq, getTableName, lt, lte, sql } from 'drizzle-orm'
import { useEffect, useState } from 'react'
import { addDatabaseChangeListener } from 'expo-sqlite'
import { useSignalEffect } from '@preact/signals-react'
import { Signal } from '@preact/signals-core'

export function getAllReadingsForMeter(meterId: number) {
  const allReadings = db.$with('allReadings').as(
    db
      .select({
        meterId: reading.meterId,
        readingId: reading.id,
        value: reading.value,
        timestamp: reading.timestamp,
      })
      .from(reading)
      .where(eq(reading.meterId, meterId))
  )
  const lastReading = db.$with('lastReading').as(
    db
      .select({
        meterId: allReadings.meterId,
        readingId: allReadings.readingId,
        readingValue: allReadings.value,
        timestamp: allReadings.timestamp,
        previousReadingValue:
          sql<number>`LAG(${allReadings.value}) OVER (ORDER BY ${allReadings.timestamp})`.as(
            'previousReadingValue'
          ),
        previousSecondReadingValue:
          sql<number>`LAG(${allReadings.value}, 2) OVER (ORDER BY ${allReadings.timestamp})`.as(
            'previousSecondReadingValue'
          ),
        previousReadingTimestamp:
          sql<number>`LAG(${allReadings.timestamp}) OVER (ORDER BY ${allReadings.timestamp})`.as(
            'previousReadingTimestamp'
          ),
        previousSecondReadingTimestamp:
          sql<number>`LAG(${allReadings.timestamp}, 2) OVER (ORDER BY ${allReadings.timestamp})`.as(
            'previousSecondReadingTimestamp'
          ),
      })
      .from(allReadings)
  )
  const readingDifferences = db.$with('readingDifferences').as(
    db
      .select({
        meterId: lastReading.meterId,
        readingId: lastReading.readingId,
        readingValue: lastReading.readingValue,
        readingTimestamp: lastReading.timestamp,
        difference:
          sql<number>`${lastReading.readingValue} - ${lastReading.previousReadingValue}`.as(
            'difference'
          ),
        differencePerSecond:
          sql<number>`(${lastReading.readingValue} - ${lastReading.previousReadingValue}) / NULLIF((${lastReading.timestamp} - ${lastReading.previousReadingTimestamp}), 0)`.as(
            'differencePerSecond'
          ),
        previousDifferencePerDay:
          sql<number>`(${lastReading.previousReadingValue} - ${lastReading.previousSecondReadingValue}) / NULLIF((${lastReading.previousReadingTimestamp} - ${lastReading.previousSecondReadingTimestamp}) / 86400.0, 0)`.as(
            'previousDifferencePerDay'
          ),
      })
      .from(lastReading)
  )
  return db
    .with(allReadings, lastReading, readingDifferences)
    .select({
      readingId: readingDifferences.readingId,
      unitAbbreviation: unit.abbreviation,
      precision: meter.precision,
      readingValue: readingDifferences.readingValue,
      readingTimestamp: readingDifferences.readingTimestamp,
      difference: readingDifferences.difference,
      differencePerSecond: readingDifferences.differencePerSecond,
      differencePerDay: sql<number>`(${readingDifferences.differencePerSecond} * 86400.0)`.as(
        'differencePerDay'
      ),
      percentileChange:
        sql<number>`((${readingDifferences.differencePerSecond} * 86400.0) - ${readingDifferences.previousDifferencePerDay}) / NULLIF(${readingDifferences.previousDifferencePerDay}, 0) * 100`.as(
          'percentileChange'
        ),
    })
    .from(readingDifferences)
    .leftJoin(meter, eq(readingDifferences.meterId, meter.id))
    .leftJoin(unit, eq(meter.unitId, unit.id))
    .orderBy(desc(readingDifferences.readingTimestamp))
}

export async function getLastReadingForDateAndMeter(meterId: number, timestamp: Date) {
  let res = await db
    .select()
    .from(reading)
    .where(and(eq(reading.meterId, meterId), lt(reading.timestamp, timestamp)))
    .orderBy(desc(reading.timestamp), desc(reading.id))
    .limit(1)
  return res[0]
}

export function deleteReading(readingId: number) {
  return db.delete(reading).where(eq(reading.id, readingId)).execute()
}

export function createReading(values: typeof reading.$inferInsert) {
  return db.insert(reading).values(values).execute()
}

export function updateReading(readingId: number, values: Partial<typeof reading.$inferInsert>) {
  return db.update(reading).set(values).where(eq(reading.id, readingId)).execute()
}

export function getReadingById(readingId: number) {
  return db.query.reading.findFirst({ where: eq(reading.id, readingId) })
}

export function useReadingsForMeter(meterId: number) {
  const [data, setData] = useState<Awaited<ReturnType<typeof getAllReadingsForMeter>>>([])
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    getAllReadingsForMeter(meterId)
      .then((res) => {
        setData(res)
        setError(null)
      })
      .catch(setError)

    const listener = addDatabaseChangeListener((change) => {
      if (
        change.tableName !== getTableName(reading) &&
        change.tableName !== getTableName(meter) &&
        change.tableName !== getTableName(unit)
      ) {
        return
      }
      getAllReadingsForMeter(meterId)
        .then((res) => {
          setData(res)
          setError(null)
        })
        .catch(setError)
    })

    return () => {
      listener.remove()
    }
  }, [meterId])
  return [data, error] as const
}

export function useLastReadingForDateAndMeter(meterId: Signal<number>, timestamp: Signal<Date>) {
  const [data, setData] = useState<Awaited<ReturnType<typeof getLastReadingForDateAndMeter>>>()
  const [error, setError] = useState<string | null>(null)

  useSignalEffect(() => {
    const meterIdValue = meterId.value
    const timestampValue = timestamp.value
    getLastReadingForDateAndMeter(meterIdValue, timestampValue)
      .then((res) => {
        setData(res)
        setError(null)
      })
      .catch(setError)

    const listener = addDatabaseChangeListener((change) => {
      if (change.tableName !== getTableName(reading)) {
        return
      }
      getLastReadingForDateAndMeter(meterIdValue, timestampValue)
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

export function useReadingById(readingId: number) {
  const [data, setData] = useState<Awaited<ReturnType<typeof getReadingById>>>()
  const [error, setError] = useState<string | null>(null)

  useSignalEffect(() => {
    getReadingById(readingId)
      .then((res) => {
        setData(res)
        setError(null)
      })
      .catch(setError)

    const listener = addDatabaseChangeListener((change) => {
      if (change.tableName !== getTableName(reading)) {
        return
      }
      getReadingById(readingId)
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
