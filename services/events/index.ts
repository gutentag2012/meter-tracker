import { type GlobalToast } from '../../components/GlobalToast'

export default class EventEmitter {
  // eslint-disable-next-line @typescript-eslint/ban-types
  private static subscribers = new Map<string, Array<Function>>()

  // eslint-disable-next-line @typescript-eslint/ban-types
  static subscribe<CB extends Function>(event: string, callback: CB) {
    if (!EventEmitter.subscribers.has(event)) {
      EventEmitter.subscribers.set(event, [])
    }
    EventEmitter.subscribers.get(event)!.push(callback)
  }

  // eslint-disable-next-line @typescript-eslint/ban-types
  static unsubscribe<CB extends Function>(event: string, callback: CB) {
    if (!EventEmitter.subscribers.has(event)) {
      return
    }
    const index = EventEmitter.subscribers.get(event)!.findIndex((cb) => cb === callback)
    if (index === -1) {
      return
    }
    EventEmitter.subscribers.get(event)!.splice(index, 1)
  }

  static emit(event: string, ...args: unknown[]) {
    if (!EventEmitter.subscribers.has(event)) {
      return
    }
    EventEmitter.subscribers.get(event)!.forEach((cb) => cb(...args))
  }

  static lastToast: GlobalToast | undefined
  private static toastTimeout: NodeJS.Timeout | undefined

  static emitToast(props?: GlobalToast) {
    EventEmitter.emit('global-toast', (EventEmitter.lastToast = props))

    if (EventEmitter.toastTimeout) {
      clearTimeout(EventEmitter.toastTimeout)
    }

    if (!props || props.isLoading === true) {
      return
    }

    EventEmitter.toastTimeout = setTimeout(() => {
      EventEmitter.emit('global-toast', (EventEmitter.lastToast = undefined))
    }, props.duration ?? 5000)
  }
}
