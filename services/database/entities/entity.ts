export default abstract class Entity {
  static TABLE_NAME: string

  protected constructor(public id?: number) {
  }

  static getRetrieveAllStatement(): string {
    return `SELECT * FROM ${this.TABLE_NAME}`
  }

  static getRetrieveByIdStatement(id: number): string {
    return `${this.getRetrieveAllStatement()} WHERE id = ${id}`
  }

  static getRetrieveWhereStatement(whereClause: string): string {
    return `${this.getRetrieveAllStatement()} WHERE ${whereClause}`
  }

  static getInsertionHeader(): string {
    throw new Error('Not implemented yet!')
  }

  static getMigrationStatement(from?: number, to?: number): string {
    throw new Error('Not implemented yet!')
  }

  static fromJSON(json: string): any {
    throw new Error('Not implemented yet!')
  }

  abstract getInsertionValues(): string;

}
