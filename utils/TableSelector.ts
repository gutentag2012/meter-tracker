export const tableSelector = <T>(
  selector: Partial<Record<keyof T, string>>,
  tableShort: string,
  keyPrefix = tableShort
) => {
  const prefixTable = tableShort ? `${tableShort}.` : ''
  const prefixShort = keyPrefix ? `${keyPrefix}.` : ''
  return Object.entries(selector)
    .map(([key, rename]) => `${prefixTable}${key} as ${rename || `"${prefixShort}${key}"`}`)
    .join(', ')
}
