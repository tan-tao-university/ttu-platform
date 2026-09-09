import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { databasePool, databaseUrl } from '../config/database';
import * as schema from './schema';

/**
 * Database client and Drizzle instance.
 *
 * Imports `config/database` directly so maintenance scripts (seed, admin bootstrap) do not require
 * Keycloak/MinIO settings to run.
 */
export const client = postgres(databaseUrl, {
  max: databasePool.max,
  connect_timeout: databasePool.connectTimeoutSeconds,
  idle_timeout: databasePool.idleTimeoutSeconds,
  max_lifetime: databasePool.maxLifetimeSeconds,
});
export const db = drizzle(client, { schema });
export type Db = typeof db;
