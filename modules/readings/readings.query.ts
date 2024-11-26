import { db } from '@/database/db'
import { meter, reading, unit } from '@/database/schema'
import { and, or, desc, eq, getTableName, gte, lt, lte, sql } from 'drizzle-orm'
import { useEffect, useState } from 'react'
import { addDatabaseChangeListener } from 'expo-sqlite'
import { useSignal, useSignalEffect } from '@preact/signals-react'
import { Signal } from '@preact/signals-core'

export function getAllReadingsForMeter(
  meterId: number,
  filter?: {
    from: Date | null
    until: Date | null
    selectedYears: string[]
  }
) {
  const sqlFilter = filter
    ? filter.selectedYears && filter.selectedYears.length > 0
      ? or(
          ...filter.selectedYears.map((year) =>
            and(
              gte(reading.timestamp, new Date(+year, 0, 1)),
              lt(reading.timestamp, new Date(+year + 1, 0, 1))
            )
          )
        )
      : and(
          filter.from ? gte(reading.timestamp, filter.from) : undefined,
          filter.until ? lt(reading.timestamp, filter.until) : undefined
        )
    : undefined
  const allReadings = db.$with('allReadings').as(
    db
      .select({
        meterId: reading.meterId,
        readingId: reading.id,
        value: reading.value,
        timestamp: reading.timestamp,
      })
      .from(reading)
      .where(and(eq(reading.meterId, meterId), sqlFilter))
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

export async function getYearlyUsagesForMeter(meterId: number) {
  const yearlyReadings = db.$with('yearlyReadings').as(
    db
      .select({
        meterId: reading.meterId,
        value: reading.value,
        timestamp: reading.timestamp,
        year: sql<number>`strftime('%Y', ${reading.timestamp}, 'unixepoch')`.as('year'),
        rowNumFirst:
          sql<number>`ROW_NUMBER() OVER (PARTITION BY ${reading.meterId}, strftime('%Y', ${reading.timestamp}, 'unixepoch')
                                    ORDER BY ${reading.timestamp} ASC)`.as('row_num_first'),
        rowNumLast:
          sql<number>`ROW_NUMBER() OVER (PARTITION BY ${reading.meterId}, strftime('%Y', ${reading.timestamp}, 'unixepoch')
                                    ORDER BY ${reading.timestamp} DESC)`.as('row_num_last'),
      })
      .from(reading)
      .where(eq(reading.meterId, meterId))
  )
  const aggregatedReadings = db.$with('aggregatedReadings').as(
    db
      .select({
        meterId: yearlyReadings.meterId,
        year: yearlyReadings.year,
        firstReadingValue:
          sql<number>`MAX(CASE WHEN ${yearlyReadings.rowNumFirst} = 1 THEN ${yearlyReadings.value} END )`.as(
            'first_reading_value'
          ),
        lastReadingValue:
          sql<number>`MAX(CASE WHEN ${yearlyReadings.rowNumLast} = 1 THEN ${yearlyReadings.value} END)`.as(
            'last_reading_value'
          ),
        firstReadingTimestamp:
          sql<number>`MAX(CASE WHEN ${yearlyReadings.rowNumFirst} = 1 THEN ${yearlyReadings.timestamp} END)`
            .mapWith(reading.timestamp)
            .as('first_reading_timestamp'),
        lastReadingTimestamp:
          sql<number>`MAX(CASE WHEN ${yearlyReadings.rowNumLast} = 1 THEN ${yearlyReadings.timestamp} END)`
            .mapWith(reading.timestamp)
            .as('last_reading_timestamp'),
      })
      .from(yearlyReadings)
      .groupBy(yearlyReadings.meterId, yearlyReadings.year as any)
  )
  const usageCalculation = db.$with('usageCalculation').as(
    db
      .select({
        meterId: aggregatedReadings.meterId,
        year: aggregatedReadings.year,
        lastReadingPreviousYear:
          sql<number>`LAG(${aggregatedReadings.lastReadingValue}, 1) OVER (PARTITION BY ${aggregatedReadings.meterId} ORDER BY ${aggregatedReadings.year})`.as(
            'last_reading_previous_year'
          ),
        lastReadingPreviousYearTimestamp:
          sql<number>`LAG(${aggregatedReadings.lastReadingTimestamp}, 1) OVER (PARTITION BY ${aggregatedReadings.meterId} ORDER BY ${aggregatedReadings.year})`.as(
            'last_reading_previous_year_timestamp'
          ),
        firstReadingNextYear:
          sql<number>`LEAD(${aggregatedReadings.firstReadingValue}, 1) OVER (PARTITION BY ${aggregatedReadings.meterId} ORDER BY ${aggregatedReadings.year})`.as(
            'first_reading_next_year'
          ),
        firstReadingNextYearTimestamp:
          sql<number>`LEAD(${aggregatedReadings.firstReadingTimestamp}, 1) OVER (PARTITION BY ${aggregatedReadings.meterId} ORDER BY ${aggregatedReadings.year})`.as(
            'first_reading_next_year_timestamp'
          ),
        firstReadingValue: aggregatedReadings.firstReadingValue,
        lastReadingValue: aggregatedReadings.lastReadingValue,
        firstReadingTimestamp: aggregatedReadings.firstReadingTimestamp,
        lastReadingTimestamp: aggregatedReadings.lastReadingTimestamp,
        secondsBetweenReadingPreviousYear:
          sql<number>`(${aggregatedReadings.firstReadingTimestamp} - LAG(${aggregatedReadings.lastReadingTimestamp}, 1) OVER (PARTITION BY ${aggregatedReadings.meterId} ORDER BY ${aggregatedReadings.year}))`.as(
            'seconds_between_reading_previous_year'
          ),
        secondsBetweenReadingNextYear:
          sql<number>`(LEAD(${aggregatedReadings.firstReadingTimestamp}, 1) OVER (PARTITION BY ${aggregatedReadings.meterId} ORDER BY ${aggregatedReadings.year}) - ${aggregatedReadings.lastReadingTimestamp})`.as(
            'seconds_between_reading_next_year'
          ),
        secondsInCurrentYearFromStart:
          sql<number>`${aggregatedReadings.firstReadingTimestamp} - strftime('%s', ${aggregatedReadings.year} || '-01-01')`.as(
            'seconds_in_current_year_from_start'
          ),
        secondsInCurrentYearToEnd:
          sql<number>`strftime('%s', ${aggregatedReadings.year} || '-01-01', '+1 year') - ${aggregatedReadings.lastReadingTimestamp}`.as(
            'seconds_in_current_year_to_end'
          ),
      })
      .from(aggregatedReadings)
  )
  const summedYearlyUsages = db.$with('summedYearlyUsages').as(
    db
      .select({
        year: usageCalculation.year,
        unitAbbreviation: unit.abbreviation,
        usage:
          sql<number>`(${usageCalculation.lastReadingValue} - ${usageCalculation.firstReadingValue}) 
                        + COALESCE(
                            (${usageCalculation.firstReadingValue} - ${usageCalculation.lastReadingPreviousYear}) *
                            (1.0 * ${usageCalculation.secondsInCurrentYearFromStart} / ${usageCalculation.secondsBetweenReadingPreviousYear}),
                            0
                          )
                        + COALESCE(
                            (${usageCalculation.firstReadingNextYear} - ${usageCalculation.lastReadingValue}) *
                            (1.0 * ${usageCalculation.secondsInCurrentYearToEnd} / ${usageCalculation.secondsBetweenReadingNextYear}),
                            0
                          )`.as('usage'),
      })
      .from(usageCalculation)
      .leftJoin(meter, eq(usageCalculation.meterId, meter.id))
      .leftJoin(unit, eq(meter.unitId, unit.id))
  )
  return db
    .with(yearlyReadings, aggregatedReadings, usageCalculation, summedYearlyUsages)
    .select()
    .from(summedYearlyUsages)
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

export function useReadingsForMeterFiltered(
  meterId: number,
  from: Signal<Date | null>,
  until: Signal<Date | null>,
  selectedYears: Signal<string[]>
) {
  const [data, setData] = useState<Awaited<ReturnType<typeof getAllReadingsForMeter>>>([])
  const [error, setError] = useState<string | null>(null)

  const meterIdSignal = useSignal(meterId)
  useEffect(() => {
    meterIdSignal.value = meterId
  }, [meterId])

  useSignalEffect(() => {
    const meterIdValue = meterIdSignal.value
    const fromValue = from.value
    const untilValue = until.value
    const selectedYearValue = selectedYears.value
    const filter = {
      from: fromValue,
      until: untilValue,
      selectedYears: selectedYearValue,
    }

    getAllReadingsForMeter(meterIdValue, filter)
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
      getAllReadingsForMeter(meterIdValue, filter)
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

export function useYearlyUsagesForMeter(meterId: number) {
  const [data, setData] = useState<Awaited<ReturnType<typeof getYearlyUsagesForMeter>>>([])
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    getYearlyUsagesForMeter(meterId)
      .then((res) => {
        setData(res)
        setError(null)
      })
      .catch(setError)

    const listener = addDatabaseChangeListener((change) => {
      if (change.tableName !== getTableName(reading) && change.tableName !== getTableName(unit)) {
        return
      }
      getYearlyUsagesForMeter(meterId)
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
