import { db } from '@/database/db'
import { contract, meter, reading, unit } from '@/database/schema'
import { eq, getTableName, lte, sql } from 'drizzle-orm'
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
        row: sql<number>`ROW_NUMBER() OVER (PARTITION BY ${reading.meterId} ORDER BY ${reading.timestamp} DESC)`.as(
          'row'
        ),
      })
      .from(meter)
      .leftJoin(reading, eq(reading.meterId, meter.id))
      .where(eq(meter.buildingId, buildingId))
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
            'last_difference_per_day'
          ),
        secondDifferencePerDay:
          sql<number>`(MAX(CASE WHEN ${rankedReadingsPerMeter.row} = 2 THEN ${rankedReadingsPerMeter.readingValue} END)
                                       - MAX(CASE WHEN ${rankedReadingsPerMeter.row} = 3 THEN ${rankedReadingsPerMeter.readingValue} END))
                                       / NULLIF((MAX(CASE WHEN ${rankedReadingsPerMeter.row} = 2 THEN ${rankedReadingsPerMeter.readingDate} END)
                                       - MAX(CASE WHEN ${rankedReadingsPerMeter.row} = 3 THEN ${rankedReadingsPerMeter.readingDate} END)) / 86400.0, 0)`.as(
            'second_difference_per_day'
          ),
        lastReading:
          sql<number>`MAX(CASE WHEN ${rankedReadingsPerMeter.row} = 1 THEN ${rankedReadingsPerMeter.readingValue} END)`.as(
            'lastReading'
          ),
        lastReadingDate:
          sql<number>`MAX(CASE WHEN ${rankedReadingsPerMeter.row} = 1 THEN ${rankedReadingsPerMeter.readingDate} END)`
            .mapWith(reading.timestamp)
            .as('lastReadingDate'),
      })
      .from(rankedReadingsPerMeter)
      .where(lte(rankedReadingsPerMeter.row, 3))
      .groupBy(rankedReadingsPerMeter.meterId)
  )
  return db
    .with(rankedReadingsPerMeter, readingDifferences)
    .select({
      meterId: readingDifferences.meterId,
      meterName: meter.name,
      meterUnit: unit.abbreviation,
      meterPrecision: meter.precision,
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
    .orderBy(meter.sortOrder)
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

export function useMetersForBuilding() {
  const [data, setData] = useState<Awaited<ReturnType<typeof getAllMetersForBuilding>>>([])
  const [error, setError] = useState<string | null>(null)

  useSignalEffect(() => {
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
  })
  return [data, error] as const
}
