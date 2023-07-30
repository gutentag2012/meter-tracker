import { useRef } from 'react'

export abstract class Service {

  protected constructor(public readonly TableName: string) {
  }

  getRetrieveAllStatement(ordered=false): string {
    return `SELECT * FROM ${ this.TableName }${ ordered ? ' ORDER BY id' : ''}`
  }

  getRetrieveByIdStatement(id: number): string {
    return `${ this.getRetrieveAllStatement() } WHERE id = ${ id }`
  }

  getRetrieveWhereStatement(whereClause: string): string {
    return `${ this.getRetrieveAllStatement() } WHERE ${ whereClause }`
  }

  getDeleteStatement(id: number): string {
    return `DELETE FROM ${ this.TableName } WHERE id = ${ id }`
  }

  getDeleteAllStatement(): string {
    return `DELETE FROM ${ this.TableName }`
  }

  abstract getCSVHeader(withChildren?: boolean): string

  abstract getInsertionHeader(forceId?: boolean): string

  abstract getMigrationStatement(from?: number, to?: number): string

  abstract fromJSON(json: string): any
}

export const useService = <T extends Service>(service: (new() => T)) => {
  const ref = useRef(new service())
  return ref.current
}
