export const Languages = {
  DE: 'de',
  EN: 'en',
} as const

export type LanguageKeys = keyof typeof Languages
export type Language = (typeof Languages)[LanguageKeys]
