import {
  sqliteTable,
  integer,
  text,
  real,
  AnySQLiteColumn,
} from 'drizzle-orm/sqlite-core'
import { sql } from 'drizzle-orm'
import { relations } from 'drizzle-orm/relations'

export const building = sqliteTable('building', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  isDefault: integer('is_default', { mode: 'boolean' }).default(sql`0`),
  name: text('name').notNull(),
  address: text('address'),
  notes: text('notes'),
})
export type BuildingInsert = typeof building.$inferInsert

export const meterType = sqliteTable('meterType', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  category: text('category').notNull(),
})

export const unit = sqliteTable('unit', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull(),
  abbreviation: text('abbreviation').notNull(),
  conversionFactor: real('conversion_factor'), // This is the conversion factor to the base unit (kWh)
  baseUnitId: integer('base_unit_id').references(
    (): AnySQLiteColumn => unit.id,
    { onDelete: 'set null' },
  ),
})

export const contract = sqliteTable('contract', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull(),
  identifier: text('identifier'),
  buildingId: integer('building_id')
    .default(1)
    .references(() => building.id, { onDelete: 'cascade' }),
  unitId: integer('unit_id')
    .notNull()
    .references(() => unit.id, { onDelete: 'set null' }),
})
export type ContractInsert = typeof contract.$inferInsert

export const contractRevision = sqliteTable('contractRevision', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  pricePerUnit: real('price_per_unit').notNull(),
  basePayment: real('base_payment').default(0),
  monthlyPayment: real('monthly_payment').default(0),
  startDate: integer('start_date', { mode: 'timestamp' }),
  // The active contract revision has no end date
  endDate: integer('end_date', { mode: 'timestamp' }),
  contractId: integer('contract_id')
    .notNull()
    .references(() => contract.id, { onDelete: 'cascade' }),
})
export type ContractRevisionInsert = typeof contractRevision.$inferInsert

export const meter = sqliteTable('meter', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull(),
  identifier: text('identifier'),
  precision: integer('precision').notNull(),
  isActive: integer('is_active', { mode: 'boolean' }).default(sql`1`),
  sortOrder: integer('sort_order').default(0),
  customUnitConversion: real('custom_unit_conversion'),
  buildingId: integer('building_id')
    .default(1)
    .references(() => building.id, { onDelete: 'cascade' }),
  typeId: integer('type_id')
    .notNull()
    .references(() => meterType.id, { onDelete: 'set null' }),
  unitId: integer('unit_id')
    .notNull()
    .references(() => unit.id, { onDelete: 'set null' }),
  contractId: integer('contract_id').references(() => contract.id, {
    onDelete: 'set null',
  }),
})
export type MeterInsert = typeof meter.$inferInsert

export const meterReset = sqliteTable('meterReset', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  timestamp: integer('timestamp', { mode: 'timestamp' })
    .notNull()
    .default(sql`(unixepoch())`),
  value: real('value').notNull(),
  meterId: integer('meter_id')
    .notNull()
    .references(() => meter.id, { onDelete: 'cascade' }),
})
export type MeterResetInsert = typeof meterReset.$inferInsert

export const reading = sqliteTable('reading', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  value: real('value').notNull(),
  timestamp: integer('timestamp', { mode: 'timestamp' })
    .notNull()
    .default(sql`(unixepoch())`),
  meterId: integer('meter_id')
    .notNull()
    .references(() => meter.id, { onDelete: 'cascade' }),
})
export type ReadingInsert = typeof reading.$inferInsert

export const buildingRelations = relations(building, ({ many }) => ({
  meters: many(meter),
  contracts: many(contract),
}))

export const contractRelations = relations(contract, ({ one, many }) => ({
  building: one(building, {
    fields: [contract.buildingId],
    references: [building.id],
  }),
  unit: one(unit, {
    fields: [contract.unitId],
    references: [unit.id],
  }),
  revisions: many(contractRevision),
  meters: many(meter),
}))

export const meterRelations = relations(meter, ({ one, many }) => ({
  building: one(building, {
    fields: [meter.buildingId],
    references: [building.id],
  }),
  type: one(meterType, {
    fields: [meter.typeId],
    references: [meterType.id],
  }),
  unit: one(unit, {
    fields: [meter.unitId],
    references: [unit.id],
  }),
  contract: one(contract, {
    fields: [meter.contractId],
    references: [contract.id],
  }),
  readings: many(reading),
}))

export const readingRelations = relations(reading, ({ one }) => ({
  meter: one(meter, {
    fields: [reading.meterId],
    references: [meter.id],
  }),
}))
