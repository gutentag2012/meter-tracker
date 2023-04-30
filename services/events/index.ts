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
}
