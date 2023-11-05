export const CONTRACT_TABLE_NAME = 'contract'
export const CONTRACT_SELECT_ALL =
  'c.id as contract_id, c.name as contract_name, c.pricePerUnit as contract_pricePerUnit, c.identification as contract_identification, c.createdAt as contract_createdAt, c.__v as contract_v'
export const BUILDING_TABLE_NAME = 'building'
export const BUILDING_SELECT_ALL =
  'b.id as building_id, b.name as building_name, b.address as building_address, b.notes as building_notes, b.createdAt as building_createdAt, b.__v as building_v'
export const METER_TABLE_NAME = 'meter'
export const METER_SELECT_ALL =
  'm.name as meter_name, m.digits as meter_digits, m.unit as meter_unit, m.contract_id as meter_contract_id, m.building_id as meter_building_id, m.areValuesDepleting as meter_areValuesDepleting, m.isRefillable as meter_isRefillable, m.isActive as meter_isActive, m.identification as meter_identification, m.createdAt as meter_createdAt, m.sortingOrder as meter_order, m.id as meter_id, m.__v as meter_v'
export const MEASUREMENT_TABLE_NAME = 'measurement'
export const MEASUREMENT_SELECT_ALL =
  'mm.value as measurement_value, mm.meter_id as measurement_meter_id, mm.createdAt as measurement_createdAt, mm.id as measurement_id, mm.__v as measurement_v'
