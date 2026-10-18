import { z } from 'zod';

const DEV_DATABASE_URL = 'postgres://postgres:postgres@localhost:5432/onboarding';

const schema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().int().positive().default(3001),
  LOG_LEVEL: z.enum(['fatal', 'error', 'warn', 'info', 'debug', 'trace', 'silent']).default('info'),
  DATABASE_URL: z.string().url().optional(),
});

export function loadConfig(env: NodeJS.ProcessEnv = process.env) {
  const parsed = schema.parse(env);
  const isProd = parsed.NODE_ENV === 'production';

  // Fail fast in production instead of silently falling back to a development default.
  if (isProd && !parsed.DATABASE_URL) throw new Error('DATABASE_URL is required in production');

  return {
    nodeEnv: parsed.NODE_ENV,
    isProd,
    isTest: parsed.NODE_ENV === 'test',
    port: parsed.PORT,
    logLevel: parsed.LOG_LEVEL,
    databaseUrl: parsed.DATABASE_URL ?? DEV_DATABASE_URL,
  };
}

export type Config = ReturnType<typeof loadConfig>;
export const config = loadConfig();
