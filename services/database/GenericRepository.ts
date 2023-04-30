import { useCallback, useEffect, useRef, useState } from 'react'
import EventEmitter from '../events'
import type Entity from './entities/entity'
import db from './index'
import { Service, useService } from './services/service'

// TODO Implement change listeners

export const useRepository = <T extends Entity, S extends Service>(Service: (new() => S)): [GenericRepository<T>, S] => {
  const service = useService(Service)
  const repo = useRef(new GenericRepository<T>(service))
  return [repo.current, service]
}

export const useUpdatedData = <T extends Entity, S extends Service>(Service: (new() => S)): [Array<T>, () => Promise<void>, GenericRepository<T>, S] => {
  const [data, setData] = useState<Array<T>>([])

  const [repo, service] = useRepository<T, S>(Service)

  const reload = useCallback(async () => {
      const data = await repo.getAllData()
    setData(data)
    }, [repo],
  )

  useEffect(() => {
    reload()
      .catch((error) => console.log('Error while reloading data: ', error))
    const onUpdate = () => {
      setTimeout(() => reload(), 100) // Small Timer for other transactions to settle
    }
    EventEmitter.subscribe(`data-inserted`, onUpdate)

    return () => EventEmitter.unsubscribe(`data-inserted`, onUpdate)
  }, [reload])

  return [data, reload, repo, service]
}

export default class GenericRepository<T extends Entity> {

  constructor(private service: Service) {
  }

  insertData(data: T): Promise<T> {
    return new Promise((resolve, reject) => db.transaction(tx => {
      tx.executeSql(
        this.service.getInsertionHeader() + data.getInsertionValues(),
        [],
        async (_, rows) => {
          const freshData = await this.getDataById<T>(rows.insertId!)
          if (!freshData) {
            return
          }

          EventEmitter.emit(`data-inserted`, freshData)
          resolve(freshData)
        },
        (_, error) => {
          reject(error)
          return true
        },
      )
    }))
  }

  getAllData(): Promise<Array<T>> {
    return new Promise((resolve, reject) => {
      db.transaction(tx => {
        tx.executeSql(
          this.service.getRetrieveAllStatement(),
          [],
          (_, { rows }) => {
            resolve(rows._array.map(this.service.fromJSON.bind(this.service)))
          },
          (_, error) => {
            console.log(`Error while retrieving ${ this.service.TableName } entity: `, error)
            reject(error)
            return true
          },
        )
      })
    })
  }

  executeRaw<R>(statement: string): Promise<R | undefined> {
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

  getDataById<T extends Entity>(id: number): Promise<T | undefined> {
    return new Promise((resolve, reject) => {
      db.transaction(tx => {
        tx.executeSql(
          this.service.getRetrieveByIdStatement(id),
          [],
          (_, { rows }) => {
            resolve(rows._array.length > 0 ? this.service.fromJSON(rows._array[0]) : undefined)
          },
          (_, error) => {
            console.log(`Error while retrieving ${ this.service.TableName } entity: `, error)
            reject(error)
            return true
          },
        )
      })
    })
  }
}
