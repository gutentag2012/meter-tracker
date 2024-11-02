import { db } from '@/database/db'
import { contract, meter, reading, unit } from '@/database/schema'
import { desc, eq, getTableName, sql } from 'drizzle-orm'
import { useEffect, useState } from 'react'
import { addDatabaseChangeListener } from 'expo-sqlite'

// TODO Add costs

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
      unitAbbreviation: unit.abbreviation,
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
      if (change.tableName !== getTableName(reading)) {
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
