import type Entity from './entities/entity'
import db from './index'

export default abstract class GenericRepository {

  static insertData<T extends Entity>(entity: (typeof Entity), data: T): Promise<T> {
    return new Promise((resolve, reject) => db.transaction(tx => {
      tx.executeSql(
        entity.getInsertionHeader() + data.getInsertionValues(),
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

  static getAllData<T extends Entity>(entity: (typeof Entity)): Promise<Array<T>> {
    return new Promise((resolve, reject) => {
      db.transaction(tx => {
        tx.executeSql(
          entity.getRetrieveAllStatement(),
          [],
          (_, { rows }) => {
            resolve(rows._array.map(entity.fromJSON))
          },
          (_, error) => {
            console.log(`Error while retrieving ${ entity.TABLE_NAME } entity: `, error)
            reject(error)
            return true
          },
        )
      })
    })
  }

  static executeRaw<T extends Entity, R>(statement: string): Promise<R> {
    return new Promise((resolve, reject) => {
      db.transaction(tx => {
        tx.executeSql(
          statement,
          [],
          (_, { rows }) => {
            resolve(rows._array as R)
          },
          (_, error) => {
            console.log(`Error while executing raw statement '${ statement }'`, error)
            reject(error)
            return true
          },
        )
      })
    })
  }

  static getDataById<T extends Entity>(entity: (typeof Entity), id: number): Promise<T | undefined> {
    return new Promise((resolve, reject) => {
      db.transaction(tx => {
        tx.executeSql(
          entity.getRetrieveByIdStatement(id),
          [],
          (_, { rows }) => {
            resolve(rows._array.length > 0 ? entity.fromJSON(rows._array[0]) : undefined)
          },
          (_, error) => {
            console.log(`Error while retrieving ${ entity.TABLE_NAME } entity: `, error)
            reject(error)
            return true
          },
        )
      })
    })
  }
}
