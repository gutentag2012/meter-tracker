const lang = {
  common: {
    app_name: 'Test english',
  },
  utils: {
  }
}

type PathOf<T> = {
  // @ts-ignore
  [K in keyof T]: T[K] extends object ? `${ K }.${ PathOf<T[K]> }` : K
}[keyof T]

export type Language = typeof lang
export type LangKey = PathOf<Language>

export default lang
