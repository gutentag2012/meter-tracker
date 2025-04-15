import { convertToCSV, parseCSV, parsedCsvToJSON } from '@/modules/settings/serialization'
import {db, Schema} from "@/database/db";
import { aliasedTable, and, eq, sql } from 'drizzle-orm'
import { translate } from '@/modules/general/translations'
import { reading } from '@/database/schema'

export type ExportMappings = {
  include: Record<string, Record<string, boolean>>,
}

export async function exportCSV(mapping: ExportMappings) {
  // Check if we need to include data at all
  const hasAnyFields = Object.values(mapping.include).some((fields) =>
    Object.values(fields).some((v) => v)
  );
  if (!hasAnyFields) return "";

  const selectFields: Record<string, any> = {};

  const meterUnit = aliasedTable(Schema.unit, "meterUnit");
  const contractUnit = aliasedTable(Schema.unit, "contractUnit");

  // Build the flat select object based on mapping
  const addFields = (entity: string, table: any, fieldMapping: Record<string, boolean>) => {
    for (const [field, include] of Object.entries(fieldMapping)) {
      if (!include) {
        continue
      }
      const tableField =
        field === "type" && entity === "meter"
          ? Schema.meterType.category
          : field === "unit" && entity === "meter"
            ? meterUnit.abbreviation
            : field === "valueBeforeReset" && entity === "reading"
              ? sql<number>`(COALESCE((SELECT mr.value FROM meterReset mr WHERE mr."timestamp" <= "reading".timestamp AND mr."meter_id" = "reading"."meter_id" ORDER BY mr."timestamp" DESC LIMIT 1), 0))`.as('valueCalculated')
              : field === "unit" && entity === "contract"
                ? contractUnit.abbreviation
                : table[field];
      if(!tableField) {
        console.log("Did not find", field, "in", entity)
        continue
      }
      selectFields[`${entity}_${field}`] = tableField
    }
  };

  addFields("building", Schema.building, mapping.include.buildings);
  addFields("contract", Schema.contract, mapping.include.contracts);
  addFields("contractRevision", Schema.contractRevision, mapping.include.contractRevisions);
  addFields("meter", Schema.meter, mapping.include.meters);
  addFields("reading", Schema.reading, mapping.include.readings);

  const hasMeters = Object.values(mapping.include.meters).some((v) => v);
  const hasContracts = Object.values(mapping.include.contracts).some((v) => v);
  const hasContractRevisions = Object.values(mapping.include.contractRevisions).some((v) => v);
  const hasReadings = Object.values(mapping.include.readings).some((v) => v);

  let query = db.select(selectFields).from(Schema.building) as any;
  if(hasMeters || hasReadings) {
    query = query
      .leftJoin(Schema.meter, eq(Schema.building.id, Schema.meter.buildingId))
      .leftJoin(Schema.meterType, eq(Schema.meterType.id, Schema.meter.typeId))
      .leftJoin(meterUnit, eq(meterUnit.id, Schema.meter.unitId));
  }
  if(hasContracts || hasContractRevisions) {
    query = query.leftJoin(Schema.contract, hasMeters ? eq(Schema.meter.contractId, Schema.contract.id) : eq(Schema.building.id, Schema.contract.buildingId))
      .leftJoin(contractUnit, eq(contractUnit.id, Schema.contract.unitId));
  }
  if(hasContractRevisions) {
    query = query.leftJoin(Schema.contractRevision, eq(Schema.contractRevision.contractId, Schema.contract.id));
  }
  if(hasReadings) {
    query = query.leftJoin(Schema.reading, eq(Schema.meter.id, Schema.reading.meterId));
  }

  // Execute query with left joins
  const rows = await query
    .catch((e: Error) => {
      console.error('Error exporting data', e)
      return []
    })
  .then((res: any[]) => res.map(e => {
    if(e["building_name"] === "default") e["building_name"] = translate("buildings.defaultName")
    return e
  }))

  return convertToCSV(rows);
}
