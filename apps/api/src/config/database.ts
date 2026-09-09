import { existsSync } from 'node:fs';
import { resolve } from 'node:path';

/** Load local `.env` using Node built-in environment loader if present. */
const envFile = resolve(process.cwd(), '.env');
if (existsSync(envFile)) process.loadEnvFile(envFile);

/**
 * Database configuration module.
 *
 * Separated from general config so database scripts (seed, migration) do not require full app
 * environment variables. Fails fast on import if `DATABASE_URL` is unset.
 */
export const databaseUrl = requireEnv('DATABASE_URL');
export const databasePool = {
  max: positiveIntegerEnv('DB_POOL_MAX', '10'),
  connectTimeoutSeconds: positiveIntegerEnv('DB_CONNECT_TIMEOUT_SECONDS', '10'),
  idleTimeoutSeconds: positiveIntegerEnv('DB_IDLE_TIMEOUT_SECONDS', '20'),
  maxLifetimeSeconds: positiveIntegerEnv('DB_MAX_LIFETIME_SECONDS', '1800'),
} as const;

/**
 * Shared by every `config/*` module (`config/auth.ts` reuses this for Keycloak settings) so a
 * missing required variable always fails the same way — one error shape, at import time.
 */
export function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`Missing required environment variable: ${name}`);
  return value;
}

export function optionalEnv(name: string, fallback: string): string {
  return process.env[name] || fallback;
}

function positiveIntegerEnv(name: string, fallback: string): number {
  const value = Number(optionalEnv(name, fallback));
  if (!Number.isInteger(value) || value <= 0) {
    throw new Error(`${name} must be a positive integer`);
  }
  return value;
}
