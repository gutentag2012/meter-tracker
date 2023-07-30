import { GlobalToast } from '../../components/GlobalToast'

export default class EventEmitter {
  private static subscribers = new Map<string, Array<Function>>()

  static subscribe(event: string, callback: Function) {
    if (!EventEmitter.subscribers.has(event)) {
      EventEmitter.subscribers.set(event, [])
    }
    EventEmitter.subscribers.get(event)!.push(callback)
  }

  static unsubscribe(event: string, callback: Function) {
    if (!EventEmitter.subscribers.has(event)) {
      return
    }
    const index = EventEmitter.subscribers.get(event)!.findIndex(cb => cb === callback)
    if (index === -1) {
      return
    }
    EventEmitter.subscribers.get(event)!.splice(index, 1)
  }

  static emit(event: string, ...args: any[]) {
    if (!EventEmitter.subscribers.has(event)) {
      return
    }
    EventEmitter.subscribers.get(event)!.forEach(cb => cb(...args))
  }

  static lastToast: GlobalToast | undefined
  private static toastTimeout: NodeJS.Timeout | undefined

  static emitToast(props?: GlobalToast) {
    EventEmitter.emit('global-toast', EventEmitter.lastToast = props)

    if (EventEmitter.toastTimeout) {
      clearTimeout(EventEmitter.toastTimeout)
    }

    if (!props || props.isLoading === true) {
      return
    }

    EventEmitter.toastTimeout = setTimeout(() => {
        EventEmitter.emit('global-toast', EventEmitter.lastToast = undefined)
    }, props.duration ?? 5000)
  }
}
