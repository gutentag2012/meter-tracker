import type { SQLResultSet, SQLStatementCallback, SQLStatementErrorCallback } from 'expo-sqlite/src/SQLite.types'
import { useCallback, useEffect, useRef, useState } from 'react'
import { Colors } from 'react-native-ui-lib'
import { ErrorCircleIcon } from '../../components/icons/ErrorCircleIcon'
import EventEmitter from '../events'
import type Entity from './entities/entity'
import {RunOnDB} from './index'
import { Service, useService } from './services/service'

// TODO Implement change listeners

export const useRepository = <T extends Entity, S extends Service>(Service: (new() => S)): [GenericRepository<T>, S] => {
  const service = useService(Service)
  const repo = useRef(new GenericRepository<T>(service))
  return [repo.current, service]
}

export const useManualUpdatedData = (reload: () => void, events = ['data-inserted', 'data-removed']) => {
  useEffect(() => {
    reload()
    const onUpdate = () => {
      setTimeout(() => reload(), 100) // Small Timer for other transactions to settle
    }
    events.forEach(event => EventEmitter.subscribe(event, onUpdate))

    return () => {
      events.forEach(event => EventEmitter.unsubscribe(event, onUpdate))
    }
  }, [reload])
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
      .catch((error) => console.error('Error while reloading data: ', error))
    const onUpdate = () => {
      setTimeout(() => reload(), 100) // Small Timer for other transactions to settle
    }
    EventEmitter.subscribe(`data-inserted`, onUpdate)
    EventEmitter.subscribe(`data-removed`, onUpdate)

    return () => {
      EventEmitter.unsubscribe(`data-inserted`, onUpdate)
      EventEmitter.unsubscribe(`data-removed`, onUpdate)
    }
  }, [reload])

  return [data, reload, repo, service]
}

export default class GenericRepository<T extends Entity> {

  constructor(private service: Service) {
  }

  insertData(data: T, forceId = false, shouldEmit = true): Promise<T | undefined> {
    return RunOnDB(this.service.getInsertionHeader(forceId) + data.getInsertionValues(forceId))
      .then(async (rows) => {
        const freshData = await this.getDataById<T>(rows.insertId!)
        if (!freshData) {
          return
        }

        if (shouldEmit) {
          EventEmitter.emit(`data-inserted`, freshData)
        }
        return freshData
      })
      .catch((error) => {
        console.log('Error while inserting data: ', error)
        EventEmitter.emitToast({
          message: error?.message ?? error,
          duration: 5000,
          icon: ErrorCircleIcon,
          colors: {
            background: Colors.errorContainer,
            text: Colors.onErrorContainer,
            button: 'error',
          },
        })
        return undefined
      })
  }

  updateData(data: T): Promise<T | undefined> {
    return RunOnDB(data.getUpdateStatement())
      .then(async () => {
        const freshData = await this.getDataById<T>(data.id!)
        if (!freshData) {
          return
        }

        EventEmitter.emit(`data-inserted`, freshData)
        return freshData
      })
      .catch(err => {
        console.error(`Error while updating ${ this.service.TableName } entity: `, err)
        EventEmitter.emitToast({
          message: err?.message ?? err,
          duration: 5000,
          icon: ErrorCircleIcon,
          colors: {
            background: Colors.errorContainer,
            text: Colors.onErrorContainer,
            button: 'error',
          },
        })
        return undefined
      })
  }

  getAllData(): Promise<Array<T>> {
    return RunOnDB(
      this.service.getRetrieveAllStatement(true),
    )
      .then(({ rows }) => rows._array.map(this.service.fromJSON.bind(this.service)))
      .catch(err => {
        console.error(`Error while retrieving ${ this.service.TableName } entity: `, err)
        EventEmitter.emitToast({
          message: err?.message ?? err,
          duration: 5000,
          icon: ErrorCircleIcon,
          colors: {
            background: Colors.errorContainer,
            text: Colors.onErrorContainer,
            button: 'error',
          },
        })
        return []
      })
  }

  executeRaw<R>(statement: string): Promise<R | undefined> {
    return RunOnDB(statement)
      .then(({ rows }) => rows._array as R)
      .catch(err => {
        console.error(`Error while executing raw statement '${ statement }'`, err)
        EventEmitter.emitToast({
          message: err?.message ?? err,
          duration: 5000,
          icon: ErrorCircleIcon,
          colors: {
            background: Colors.errorContainer,
            text: Colors.onErrorContainer,
            button: 'error',
          },
        })
        return undefined
      })
  }

  deleteEntry(id: number): Promise<void> {
    return RunOnDB(this.service.getDeleteStatement(id))
      .then(() =>
        EventEmitter.emit(`data-removed`, {
          id,
          tableName: this.service.TableName,
        }))
      .catch(err => {
        console.error(`Error while deleting ${ this.service.TableName } entity: `, err)
        EventEmitter.emitToast({
          message: err?.message ?? err,
          duration: 5000,
          icon: ErrorCircleIcon,
          colors: {
            background: Colors.errorContainer,
            text: Colors.onErrorContainer,
            button: 'error',
          },
        })
      })
  }

  getDataById<T extends Entity>(id: number): Promise<T | undefined> {
    return RunOnDB(this.service.getRetrieveByIdStatement(id))
      .then(({ rows }) => rows._array.length > 0 ? this.service.fromJSON(rows._array[0]) : undefined)
      .catch(err => {
        console.error(`Error while retrieving ${ this.service.TableName } entity: `, err)
        EventEmitter.emitToast({
          message: err?.message ?? err,
          duration: 5000,
          icon: ErrorCircleIcon,
          colors: {
            background: Colors.errorContainer,
            text: Colors.onErrorContainer,
            button: 'error',
          },
        })
        return undefined
      })
  }
}
