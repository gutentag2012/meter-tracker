import { useEffect, useState } from 'react'
import AsyncStorage from '@react-native-async-storage/async-storage'
import EventEmitter from '@/events'

export const Truthy = <T>(x: T | null | undefined): x is T => !!x

export const useAsyncStorageValue = <T>(key: string): T | undefined => {
  const [value, setValue] = useState<T | undefined>()

  useEffect(() => {
    AsyncStorage.getItem(key).then((value) => {
      if (!value) {
        setValue(undefined)
        return
      }

      setValue(JSON.parse(value))
    })

    const onValueChange = (v: T | undefined) => {
      console.log('Changed Async Value', key, v)
      setValue(v)
    }

    EventEmitter.subscribe(`settings-${key}`, onValueChange)
    return () => EventEmitter.unsubscribe(`settings-${key}`, onValueChange)
  }, [key])

  return value
}
