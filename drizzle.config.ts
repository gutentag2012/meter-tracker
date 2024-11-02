import type { Config } from 'drizzle-kit'
export default {
  schema: './database/schema.ts',
  out: './database/drizzle',
  dialect: 'sqlite',
  driver: 'expo',
  verbose: true,
  strict: true,
} satisfies Config
