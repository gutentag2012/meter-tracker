import type Entity from './entities/entity'
import db from './index'

export default class GenericRepository {

  constructor(private entity: (typeof Entity)) {
  }

  insertData<T extends Entity>(data: T): Promise<T> {
    return new Promise((resolve, reject) => db.transaction(tx => {
      tx.executeSql(
        this.entity.getInsertionHeader() + data.getInsertionValues(),
        [],
        (_, rows) => {
            data.id = rows.insertId
            resolve(data)
        },
        (_, error) => {
          reject(error)
          return true
        },
      )
    }))
  }

  getAllData<T extends Entity>(): Promise<Array<T>> {
    return new Promise((resolve, reject) => {
      db.transaction(tx => {
        tx.executeSql(
          this.entity.getRetrieveAllStatement(),
          [],
          (_, { rows }) => {
            resolve(rows._array.map(this.entity.fromJSON))
          },
          (_, error) => {
            console.log(`Error while retrieving ${ this.entity.TABLE_NAME } entity: `, error)
            reject(error)
            return true
          },
        )
      })
    })
  }

  getDataById<T extends Entity>(id: number): Promise<T|undefined> {
    return new Promise((resolve, reject) => {
      db.transaction(tx => {
        tx.executeSql(
          this.entity.getRetrieveByIdStatement(id),
          [],
          (_, { rows }) => {
            resolve(rows._array.length > 0 ? this.entity.fromJSON(rows._array[0]) : undefined)
          },
          (_, error) => {
            console.log(`Error while retrieving ${ this.entity.TABLE_NAME } entity: `, error)
            reject(error)
            return true
          },
        )
      })
    })
  }
}
