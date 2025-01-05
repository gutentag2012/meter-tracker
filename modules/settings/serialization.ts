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