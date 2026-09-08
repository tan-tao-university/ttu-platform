import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { databasePool, databaseUrl } from '../config/database';
import * as schema from './schema';

// Deliberately imports `config/database` rather than a future `config/env`: maintenance
// scripts (seed, admin bootstrap) pull this module in and should not need Keycloak/MinIO
// settings to run. The import still throws when DATABASE_URL is missing, so the API fails
// at boot rather than on its first query.
export const client = postgres(databaseUrl, {
  max: databasePool.max,
  connect_timeout: databasePool.connectTimeoutSeconds,
  idle_timeout: databasePool.idleTimeoutSeconds,
  max_lifetime: databasePool.maxLifetimeSeconds,
});
export const db = drizzle(client, { schema });
export type Db = typeof db;
