import Entity from './entity'

export default class Contract extends Entity {

  static TABLE_NAME = 'contract' as const

  constructor(
    public name: string,
    public pricePerUnit: number,
    public identification?: string,
    public createdAt: number = Date.now(),
    public id?: number,
  ) {
    super(id)
  }

  static getMigrationStatement(from?: number, to?: number): string {
    if (!from && to === 1) {
      return `
CREATE TABLE IF NOT EXISTS ${this.TABLE_NAME} (
    id                    INTEGER PRIMARY KEY AUTOINCREMENT,
    name                  TEXT NOT NULL,
    pricePerUnit          REAL NOT NULL,
    identification        TEXT,
    createdAt             INTEGER
);`
    }
    return ''
  }

  static fromJSON(json: any): Contract {
    return new Contract(json.name, json.pricePerUnit, json.identification, json.createdAt, json.id)
  }

  static getInsertionHeader(): string {
    return `INSERT INTO ${this.TABLE_NAME} (name, pricePerUnit, identification, createdAt) VALUES `
  }

  getInsertionValues(): string {
    // TODO Think about sanitizing the values
    const identification = this.identification ? `"${ this.identification }"` : 'NULL'
    return `("${ this.name }", ${ this.pricePerUnit }, ${ identification }, ${ this.createdAt })`
  }
}
