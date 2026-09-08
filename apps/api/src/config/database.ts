import { existsSync } from 'node:fs';
import { resolve } from 'node:path';

// Node's built-in .env loader (v20.12+) — no dotenv dependency. In production the values
// come from the container environment and no .env file exists, so this is a no-op there.
const envFile = resolve(process.cwd(), '.env');
if (existsSync(envFile)) process.loadEnvFile(envFile);

// Separated from a future `config/env.ts` so that a script needing only the database — a
// seed or migration helper — does not have to be handed Keycloak/MinIO settings just to
// insert a row. `db/index.ts` imports this file and nothing else from config.
//
// The API process still fails fast on a missing variable: importing this module throws
// immediately if `DATABASE_URL` is unset, so the app fails at boot rather than on its first
// query.
const rawDatabaseUrl = process.env.DATABASE_URL;
if (!rawDatabaseUrl) throw new Error('Missing required environment variable: DATABASE_URL');
export const databaseUrl = rawDatabaseUrl;

export const databasePool = {
  max: positiveIntegerEnv('DB_POOL_MAX', '10'),
  connectTimeoutSeconds: positiveIntegerEnv('DB_CONNECT_TIMEOUT_SECONDS', '10'),
  idleTimeoutSeconds: positiveIntegerEnv('DB_IDLE_TIMEOUT_SECONDS', '20'),
  maxLifetimeSeconds: positiveIntegerEnv('DB_MAX_LIFETIME_SECONDS', '1800'),
} as const;

function positiveIntegerEnv(name: string, fallback: string): number {
  const value = Number(process.env[name] || fallback);
  if (!Number.isInteger(value) || value <= 0) {
    throw new Error(`${name} must be a positive integer`);
  }
  return value;
}
