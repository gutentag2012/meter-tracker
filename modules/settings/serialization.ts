const CSVPattern = new RegExp((
  // Delimiter:
  '(\\,|\\r?\\n|\\r|^)' +
  // Quoted fields:
  '(?:"([^"]*(?:""[^"]*)*)"|' +
  // Standard fields:
  '([^"\\,\\r\\n]*))'
), 'gi')

export function parseCSV(csv: string): string[][] {
  const parsed: string[][] = [[]]

  let regexMatch = CSVPattern.exec(csv)
  while (regexMatch) {
    const matched_delimiter = regexMatch[1]
    if (matched_delimiter.length && matched_delimiter !== ',') {
      // Since this is a new row of data, add an empty row to the array.
      parsed.push([])
    }

    const value = regexMatch[2]?.replace(/""/g, '"') ?? regexMatch[3]
    parsed[parsed.length - 1].push(value)

    regexMatch = CSVPattern.exec(csv)
  }

  return parsed
}

export function parsedCsvToJSON(parsedCsv: string[][]): Record<string, string>[] {
  const headers = parsedCsv[0]
  return parsedCsv.slice(1).map((row) => {
    const rowObject: Record<string, string> = {}
    headers.forEach((header, index) => {
      rowObject[header] = row[index]
    })
    return rowObject
  })
}

export function convertToCSV(rows: Record<string, any>[]): string {
  if (!rows?.length) return "";

  const uniqueHeaders = new Set<string>();
  rows.forEach(row => {
    Object.keys(row).forEach(key => uniqueHeaders.add(key));
  });
  const headers = Array.from(uniqueHeaders);

  const escape = (val: any) =>
    `"${String(val ?? "").replace(/"/g, '""')}"`;

  const lines = [
    headers.map(escape).join(","), // header row
    ...rows.map((row) =>
      headers.map((key) => !row ? "" : escape(row[key])).join(",")
    ),
  ];

  return lines.join("\n");
}
