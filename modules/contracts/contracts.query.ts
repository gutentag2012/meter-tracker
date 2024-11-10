import { db } from '@/database/db'
import { contract, contractRevision, meter, reading, unit } from '@/database/schema'
import { aliasedTable, and, desc, eq, getTableName, isNotNull, sql } from 'drizzle-orm'
import { useState } from 'react'
import { addDatabaseChangeListener } from 'expo-sqlite'
import { useSignalEffect } from '@preact/signals-react'
import { activeBuilding } from '@/modules/buildings/buildings.signals'

export async function getAllContractsForBuilding(buildingId: number) {
  const monthlyReadings = db.$with('monthlyReadings').as(
    db
      .select({
        meterId: meter.id,
        month: sql<number>`strftime('%Y-%m',
        ${reading.timestamp},
        'unixepoch'
        )`.as('month'),
        readingTimestamp: reading.timestamp,
        readingValue: reading.value,
        rowNumFirst:
          sql<number>`ROW_NUMBER() OVER (PARTITION BY ${reading.meterId}, strftime('%Y-%m', ${reading.timestamp}, 'unixepoch')
                                    ORDER BY ${reading.timestamp} ASC)`.as('row_num_first'),
        rowNumLast:
          sql<number>`ROW_NUMBER() OVER (PARTITION BY ${reading.meterId}, strftime('%Y-%m', ${reading.timestamp}, 'unixepoch')
                                    ORDER BY ${reading.timestamp} DESC)`.as('row_num_last'),
      })
      .from(reading)
      .innerJoin(meter, eq(reading.meterId, meter.id))
      .where(
        and(
          isNotNull(meter.contractId),
          eq(meter.buildingId, buildingId),
          sql`"month" in (
              strftime('%Y-%m', 'now', 'localtime'),
              strftime('%Y-%m', 'now', 'localtime', '-1 month'),
              strftime('%Y-%m', 'now', 'localtime', '-2 month')
            )`
        )
      )
  )
  const aggregatedReadings = db.$with('aggregatedReadings').as(
    db
      .select({
        meterId: monthlyReadings.meterId,
        month: monthlyReadings.month,
        firstReadingValue:
          sql<number>`MAX(CASE WHEN ${monthlyReadings.rowNumFirst} = 1 THEN ${monthlyReadings.readingValue} END )`.as(
            'first_reading_value'
          ),
        lastReadingValue:
          sql<number>`MAX(CASE WHEN ${monthlyReadings.rowNumLast} = 1 THEN ${monthlyReadings.readingValue} END)`.as(
            'last_reading_value'
          ),
        firstReadingTimestamp:
          sql<number>`MAX(CASE WHEN ${monthlyReadings.rowNumFirst} = 1 THEN ${monthlyReadings.readingTimestamp} END)`
            .mapWith(reading.timestamp)
            .as('first_reading_timestamp'),
        lastReadingTimestamp:
          sql<number>`MAX(CASE WHEN ${monthlyReadings.rowNumLast} = 1 THEN ${monthlyReadings.readingTimestamp} END)`
            .mapWith(reading.timestamp)
            .as('last_reading_timestamp'),
      })
      .from(monthlyReadings)
      .groupBy(monthlyReadings.meterId, monthlyReadings.month as any)
  )
  const activeContractRevision = db.$with('activeContractRevision').as(
    db
      .select({
        contractId: contractRevision.contractId,
        contractPricePerUnit: contractRevision.pricePerUnit,
        contractBasePayment: contractRevision.basePayment,
        contractMonthlyPayment: contractRevision.monthlyPayment,
        contractStartDate: contractRevision.startDate,
        contractEndDate: contractRevision.endDate,
        row: sql<number>`ROW_NUMBER() OVER (PARTITION BY ${contractRevision.contractId} ORDER BY ${contractRevision.startDate} DESC)`.as(
          'row'
        ),
      })
      .from(contractRevision)
      .leftJoin(contract, eq(contractRevision.contractId, contract.id))
      .where(
        and(
          eq(contract.buildingId, buildingId),
          sql`${contractRevision.endDate} IS NULL OR ${contractRevision.endDate} >= unixepoch()`,
          sql`${contractRevision.startDate} <= unixepoch()`
        )
      )
      .orderBy(desc(contractRevision.startDate))
  )
  const meterUnit = aliasedTable(unit, 'meterUnit')
  const contractUnit = aliasedTable(unit, 'contractUnit')
  const unitConversionFactors = db.$with('unitConversionFactors').as(
    db
      .select({
        meterId: meter.id,
        meterConversionFactor:
          sql`IFNULL(${meter.customUnitConversion}, ${meterUnit.conversionFactor})`.as(
            'meter_conversion_factor'
          ),
        contractConversionFactor: sql`${contractUnit.conversionFactor}`.as(
          'contract_conversion_factor'
        ),
      })
      .from(meter)
      .leftJoin(meterUnit, eq(meter.unitId, meterUnit.id))
      .leftJoin(contract, eq(meter.contractId, contract.id))
      .leftJoin(contractUnit, eq(contract.unitId, contractUnit.id))
      .where(eq(meter.buildingId, buildingId))
  )
  const usageCalculation = db.$with('usageCalculation').as(
    db
      .select({
        meterId: aggregatedReadings.meterId,
        month: aggregatedReadings.month,
        lastReadingPreviousMonth:
          sql<number>`LAG(${aggregatedReadings.lastReadingValue}, 1) OVER (PARTITION BY ${aggregatedReadings.meterId} ORDER BY ${aggregatedReadings.month})`.as(
            'last_reading_previous_month'
          ),
        lastReadingPreviousMonthTimestamp:
          sql<number>`LAG(${aggregatedReadings.lastReadingTimestamp}, 1) OVER (PARTITION BY ${aggregatedReadings.meterId} ORDER BY ${aggregatedReadings.month})`.as(
            'last_reading_previous_month_timestamp'
          ),
        firstReadingNextMonth:
          sql<number>`LEAD(${aggregatedReadings.firstReadingValue}, 1) OVER (PARTITION BY ${aggregatedReadings.meterId} ORDER BY ${aggregatedReadings.month})`.as(
            'first_reading_next_month'
          ),
        firstReadingNextMonthTimestamp:
          sql<number>`LEAD(${aggregatedReadings.firstReadingTimestamp}, 1) OVER (PARTITION BY ${aggregatedReadings.meterId} ORDER BY ${aggregatedReadings.month})`.as(
            'first_reading_next_month_timestamp'
          ),
        firstReadingValue: aggregatedReadings.firstReadingValue,
        lastReadingValue: aggregatedReadings.lastReadingValue,
        firstReadingTimestamp: aggregatedReadings.firstReadingTimestamp,
        lastReadingTimestamp: aggregatedReadings.lastReadingTimestamp,
        secondsBetweenReadingPreviousMonth:
          sql<number>`(${aggregatedReadings.firstReadingTimestamp} - LAG(${aggregatedReadings.lastReadingTimestamp}, 1) OVER (PARTITION BY ${aggregatedReadings.meterId} ORDER BY ${aggregatedReadings.month}))`.as(
            'seconds_between_reading_previous_month'
          ),
        secondsBetweenReadingNextMonth:
          sql<number>`(LEAD(${aggregatedReadings.firstReadingTimestamp}, 1) OVER (PARTITION BY ${aggregatedReadings.meterId} ORDER BY ${aggregatedReadings.month}) - ${aggregatedReadings.lastReadingTimestamp})`.as(
            'seconds_between_reading_next_month'
          ),
        secondsInCurrentMonthFromStart:
          sql<number>`${aggregatedReadings.firstReadingTimestamp} - strftime('%s', ${aggregatedReadings.month} || '-01')`.as(
            'seconds_in_current_month_from_start'
          ),
        secondsInCurrentMonthToEnd:
          sql<number>`strftime('%s', ${aggregatedReadings.month} || '-01', '+1 month') - ${aggregatedReadings.lastReadingTimestamp}`.as(
            'seconds_in_current_month_to_end'
          ),
      })
      .from(aggregatedReadings)
  )
  const summedMonthlyUsages = db.$with('summedMonthlyUsages').as(
    db
      .select({
        meterId: usageCalculation.meterId,
        usageLastMonth: sql<number>`MAX(CASE
                                            WHEN ${usageCalculation.month} = strftime('%Y-%m', 'now', 'localtime', '-1 month') THEN
                                                (${usageCalculation.lastReadingValue} - ${usageCalculation.firstReadingValue}) -- Actual usage within the month
                                                    + COALESCE(
                                                        (${usageCalculation.firstReadingValue} - ${usageCalculation.lastReadingPreviousMonth}) *
                                                        (1.0 * ${usageCalculation.secondsInCurrentMonthFromStart} / ${usageCalculation.secondsBetweenReadingPreviousMonth}), 
                                                         0
                                                      ) -- Interpolated value for time between last and current month
                                                    + COALESCE(
                                                        (${usageCalculation.firstReadingNextMonth} - ${usageCalculation.lastReadingValue}) *
                                                        (1.0 * ${usageCalculation.secondsInCurrentMonthToEnd} / ${usageCalculation.secondsBetweenReadingNextMonth}),
                                                         0
                                                      ) -- Interpolated value for time between current and next month
                                            ELSE NULL
                                        END)`.as('usage_last_month'),
        usageCurrentMonth: sql<number>`MAX(CASE
                                            WHEN ${usageCalculation.month} = strftime('%Y-%m', 'now', 'localtime') THEN
                                                (${usageCalculation.lastReadingValue} - ${usageCalculation.firstReadingValue}) -- Actual usage within the month
                                                    + COALESCE(
                                                        (${usageCalculation.firstReadingValue} - ${usageCalculation.lastReadingPreviousMonth}) *
                                                        (1.0 * ${usageCalculation.secondsInCurrentMonthFromStart} / ${usageCalculation.secondsBetweenReadingPreviousMonth}), 
                                                         0
                                                      ) -- Interpolated value for time between last and current month
                                            ELSE NULL
                                        END)`.as('usage_current_month'),
        daysInLastMonth:
          sql<number>`julianday('now', 'start of month') - julianday('now', 'start of month', '-1 month')`.as(
            'days_in_last_month'
          ),
        daysInCurrentMonthPartial:
          sql<number>`julianday('now') - julianday('now', 'start of month')`.as(
            'days_in_current_month_partial'
          ),
        daysInCurrentYear:
          sql<number>`julianday('now', 'start of year', '+1 year') - julianday('now', 'start of year')`.as(
            'days_in_current_year'
          ),
      })
      .from(usageCalculation)
      .groupBy(usageCalculation.meterId)
  )
  const meterStats = db.$with('meterStats').as(
    db
      .select({
        contractId: meter.contractId,
        totalCostLastMonth:
          sql<number>`(${summedMonthlyUsages.usageLastMonth} * ${unitConversionFactors.meterConversionFactor} / ${unitConversionFactors.contractConversionFactor} * ${activeContractRevision.contractPricePerUnit}) + (${activeContractRevision.contractBasePayment} / ${summedMonthlyUsages.daysInCurrentYear} * ${summedMonthlyUsages.daysInLastMonth})`.as(
            'total_cost_last_month'
          ),
        totalCostCurrentMonth:
          sql<number>`(${summedMonthlyUsages.usageCurrentMonth} * ${unitConversionFactors.meterConversionFactor} / ${unitConversionFactors.contractConversionFactor} * ${activeContractRevision.contractPricePerUnit}) + (${activeContractRevision.contractBasePayment} / ${summedMonthlyUsages.daysInCurrentYear} * ${summedMonthlyUsages.daysInCurrentMonthPartial})`.as(
            'total_cost_current_month'
          ),
      })
      .from(summedMonthlyUsages)
      .leftJoin(meter, eq(summedMonthlyUsages.meterId, meter.id))
      .rightJoin(contract, eq(meter.contractId, contract.id))
      .leftJoin(contractUnit, eq(contract.unitId, contractUnit.id))
      .leftJoin(
        activeContractRevision,
        and(eq(contract.id, activeContractRevision.contractId), eq(activeContractRevision.row, 1))
      )
      .leftJoin(unitConversionFactors, eq(meter.id, unitConversionFactors.meterId))
  )
  return db
    .with(
      monthlyReadings,
      aggregatedReadings,
      activeContractRevision,
      unitConversionFactors,
      usageCalculation,
      summedMonthlyUsages,
      meterStats
    )
    .select({
      contractId: contract.id,
      contractName: contract.name,
      contractIdentifier: contract.identifier,
      contractUnit: contractUnit.abbreviation,
      pricePerUnit: activeContractRevision.contractPricePerUnit,
      basePayment: activeContractRevision.contractBasePayment,
      monthlyPayment: activeContractRevision.contractMonthlyPayment,
      totalCostLastMonth: sql<number>`SUM(${meterStats.totalCostLastMonth})`.as(
        'total_cost_last_month'
      ),
      totalCostCurrentMonth: sql<number>`SUM(${meterStats.totalCostCurrentMonth})`.as(
        'total_cost_current_month'
      ),
    })
    .from(meterStats)
    .rightJoin(contract, eq(meterStats.contractId, contract.id))
    .leftJoin(contractUnit, eq(contract.unitId, contractUnit.id))
    .leftJoin(
      activeContractRevision,
      and(eq(contract.id, activeContractRevision.contractId), eq(activeContractRevision.row, 1))
    )
    .groupBy(meterStats.contractId)
}

export function getAllContracts() {
  return db
    .select()
    .from(contract)
    .leftJoin(
      contractRevision,
      and(
        eq(contract.id, contractRevision.contractId),
        sql`${contractRevision.endDate} IS NULL OR ${contractRevision.endDate} >= unixepoch()`,
        sql`${contractRevision.startDate} <= unixepoch()`
      )
    )
    .leftJoin(unit, eq(contract.unitId, unit.id))
}

export async function createContract(values: {
  contract: typeof contract.$inferInsert
  contractRevision: Omit<typeof contractRevision.$inferInsert, 'id' | 'contractId'>
}) {
  const insertionRes = await db.insert(contract).values(values.contract).execute()
  await createContractRevision({
    ...values.contractRevision,
    contractId: insertionRes.lastInsertRowId,
  })
  return insertionRes.lastInsertRowId
}

export async function updateContract(
  contractId: number,
  values: Partial<typeof contract.$inferInsert>
) {
  return db.update(contract).set(values).where(eq(contract.id, contractId)).execute()
}

export async function createContractRevision(values: typeof contractRevision.$inferInsert) {
  return db.insert(contractRevision).values(values).execute()
}

export async function updateContractRevision(
  revisionId: number,
  values: Partial<Omit<typeof contractRevision.$inferInsert, 'id'>>
) {
  return db
    .update(contractRevision)
    .set(values)
    .where(eq(contractRevision.id, revisionId))
    .execute()
}

export async function getContractById(contractId: number) {
  const res = await db
    .select()
    .from(contract)
    .leftJoin(
      contractRevision,
      and(
        eq(contract.id, contractRevision.contractId),
        sql`${contractRevision.endDate} IS NULL OR ${contractRevision.endDate} >= unixepoch()`,
        sql`${contractRevision.startDate} <= unixepoch()`
      )
    )
    .leftJoin(unit, eq(contract.unitId, unit.id))
    .where(eq(contract.id, contractId))
    .orderBy(desc(contractRevision.startDate))
  return res[0] as
    | {
        contract: typeof contract.$inferSelect
        contractRevision: typeof contractRevision.$inferSelect
      }
    | undefined
}

export async function getAllContractRevisionsForContract(contractId: number) {
  return db.query.contractRevision.findMany({
    where: eq(contractRevision.contractId, contractId),
    orderBy: contractRevision.startDate,
  })
}

export function useContractsForBuilding() {
  const [data, setData] = useState<Awaited<ReturnType<typeof getAllContractsForBuilding>>>([])
  const [error, setError] = useState<string | null>(null)

  useSignalEffect(() => {
    getAllContractsForBuilding(activeBuilding.value)
      .then((res) => {
        setData(res)
        setError(null)
      })
      .catch(setError)

    const listener = addDatabaseChangeListener((change) => {
      if (
        change.tableName !== getTableName(reading) &&
        change.tableName !== getTableName(meter) &&
        change.tableName !== getTableName(contractRevision) &&
        change.tableName !== getTableName(contract)
      ) {
        return
      }
      getAllContractsForBuilding(activeBuilding.value)
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

export function useAllContractRevisionsForContract(contractId?: number) {
  const [data, setData] = useState<Awaited<ReturnType<typeof getAllContractRevisionsForContract>>>(
    []
  )
  const [error, setError] = useState<string | null>(null)

  useSignalEffect(() => {
    if (!contractId) return
    getAllContractRevisionsForContract(contractId)
      .then((res) => {
        setData(res)
        setError(null)
      })
      .catch(setError)

    const listener = addDatabaseChangeListener((change) => {
      if (
        change.tableName !== getTableName(contractRevision) &&
        change.tableName !== getTableName(contract)
      ) {
        return
      }
      getAllContractRevisionsForContract(contractId)
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

export function useAllContracts() {
  const [data, setData] = useState<Awaited<ReturnType<typeof getAllContracts>>>([])
  const [error, setError] = useState<string | null>(null)

  useSignalEffect(() => {
    getAllContracts()
      .then((res) => {
        setData(res)
        setError(null)
      })
      .catch(setError)

    const listener = addDatabaseChangeListener((change) => {
      if (
        change.tableName !== getTableName(contract) &&
        change.tableName !== getTableName(contractRevision)
      ) {
        return
      }
      getAllContracts()
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

export function useContractById(contractId: number) {
  const [data, setData] = useState<Awaited<ReturnType<typeof getContractById>>>()
  const [error, setError] = useState<string | null>(null)

  useSignalEffect(() => {
    getContractById(contractId)
      .then((res) => {
        setData(res)
        setError(null)
      })
      .catch(setError)

    const listener = addDatabaseChangeListener((change) => {
      if (
        change.tableName !== getTableName(contract) &&
        change.tableName !== getTableName(contractRevision)
      ) {
        return
      }
      getContractById(contractId)
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
