import { convertToCSV } from '@/modules/settings/serialization'
import {db, Schema} from "@/database/db";
import { aliasedTable, eq, sql } from 'drizzle-orm'
import { translate } from '@/modules/general/translations'
import { isAvailableAsync, shareAsync } from 'expo-sharing'
import { cacheDirectory, EncodingType, writeAsStringAsync } from 'expo-file-system'

async function exportCSV() {
  const meterUnit = aliasedTable(Schema.unit, "meterUnit");
  const contractUnit = aliasedTable(Schema.unit, "contractUnit");

  // Execute query with left joins
  const rows = await db
    .select({
      building: Schema.building,
      meter: Schema.meter,
      meterType: Schema.meterType,
      meterUnit: meterUnit,
      meterReset: {
        id: sql<number>`COALESCE((SELECT mr.id FROM meterReset mr WHERE mr."timestamp" <= "reading".timestamp AND mr."meter_id" = ${Schema.meter.id} ORDER BY mr."timestamp" DESC LIMIT 1), NULL)`.mapWith(Schema.meterReset.id).as(
          'reset_id',
        ),
        timestamp:
          sql<number>`COALESCE((SELECT mr.timestamp FROM meterReset mr WHERE mr."timestamp" <= "reading".timestamp AND mr."meter_id" = ${Schema.meter.id} ORDER BY mr."timestamp" DESC LIMIT 1), NULL)`.mapWith(Schema.meterReset.timestamp).as(
            'reset_timestamp',
          ),
        value:
          sql<number>`COALESCE((SELECT mr.value FROM meterReset mr WHERE mr."timestamp" <= "reading".timestamp AND mr."meter_id" = ${Schema.meter.id} ORDER BY mr."timestamp" DESC LIMIT 1), NULL)`.mapWith(Schema.meterReset.value).as(
            'reset_value',
          ),
        meterId:
          sql<number>`COALESCE((SELECT mr."meter_id" FROM meterReset mr WHERE mr."timestamp" <= "reading".timestamp AND mr."meter_id" = ${Schema.meter.id} ORDER BY mr."timestamp" DESC LIMIT 1), NULL)`.mapWith(Schema.meterReset.meterId).as(
            'reset_meter_id',
          ),
      },
      contract: Schema.contract,
      contractUnit: contractUnit,
      contractRevision: Schema.contractRevision,
      reading: Schema.reading,
    })
    .from(Schema.building)
    .leftJoin(Schema.meter, eq(Schema.building.id, Schema.meter.buildingId))
    .leftJoin(Schema.meterType, eq(Schema.meterType.id, Schema.meter.typeId))
    .leftJoin(meterUnit, eq(meterUnit.id, Schema.meter.unitId))
    .leftJoin(
      Schema.contract,
      eq(Schema.building.id, Schema.contract.buildingId),
    )
    .leftJoin(contractUnit, eq(contractUnit.id, Schema.contract.unitId))
    .leftJoin(
      Schema.contractRevision,
      eq(Schema.contractRevision.contractId, Schema.contract.id),
    )
    .leftJoin(Schema.reading, eq(Schema.meter.id, Schema.reading.meterId))
    .catch((e: Error) => {
      console.error('Error exporting data', e)
      return []
    })
    .then((res: any[]) =>
      res.map(
        (e: any): Record<string, string> =>
          Object.entries(e).reduce(
            (acc, [objectKey, value]) => {
              Object.entries(value as any).forEach(([key, val]) => {
                if (objectKey === 'building' && key === 'name') {
                  val = translate(`buildings.defaultName`)
                }
                acc[`${objectKey}.${key}`] = val instanceof Date ? val.getTime().toString() : JSON.stringify(val)
              })
              return acc
            },
            {} as Record<string, string>,
          ),
      ),
    )

  return convertToCSV(rows);
}

export async function exportAndShareDatabase() {
  if(!await isAvailableAsync()) return;

  const csvString = await exportCSV()
  const exportFileName = `meter_tracker-export_${new Date().toISOString()}.csv`
  const fileUri = `${cacheDirectory}${exportFileName}`

  await writeAsStringAsync(fileUri, csvString, {
    encoding: EncodingType.UTF8,
  })

  await shareAsync(fileUri)
}