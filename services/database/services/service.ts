import { useRef } from 'react'

export abstract class Service {

  protected constructor(public readonly TableName: string) {
  }

  getRetrieveAllStatement(): string {
    return `SELECT * FROM ${ this.TableName }`
  }

  getRetrieveByIdStatement(id: number): string {
    return `${ this.getRetrieveAllStatement() } WHERE id = ${ id }`
  }

  getRetrieveWhereStatement(whereClause: string): string {
    return `${ this.getRetrieveAllStatement() } WHERE ${ whereClause }`
  }

  abstract getInsertionHeader(): string

  abstract getMigrationStatement(from?: number, to?: number): string

  abstract fromJSON(json: string): any
}

export const useService = <T extends Service>(service: (new() => T)) => {
  const ref = useRef(new service())
  return ref.current
}
