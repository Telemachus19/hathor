import { drizzle, NodePgDatabase } from 'drizzle-orm/node-postgres';
import pg from 'pg';
import * as schema from './schema/index.js';

const { Pool } = pg;

// Connection Strings with Database-per-Service Isolation Support
const baseMasterUrl =
  process.env.POSTGRES_MASTER_URL ||
  process.env.DATABASE_URL ||
  'postgresql://postgres:postgrespassword@localhost:5432';

export const authDbUrl =
  process.env.AUTH_DB_URL || `${baseMasterUrl}/auth_db`;

export const catalogDbUrl =
  process.env.CATALOG_DB_URL || `${baseMasterUrl}/catalog_db`;

export const commerceDbUrl =
  process.env.COMMERCE_DB_URL || `${baseMasterUrl}/commerce_db`;

export const libraryDbUrl =
  process.env.LIBRARY_DB_URL || `${baseMasterUrl}/library_db`;

// Service Database Pools
export const authPool = new Pool({ connectionString: authDbUrl });
export const catalogPool = new Pool({ connectionString: catalogDbUrl });
export const commercePool = new Pool({ connectionString: commerceDbUrl });
export const libraryPool = new Pool({ connectionString: libraryDbUrl });

// Service Database Clients
export const authDb: NodePgDatabase<typeof schema> = drizzle(authPool, { schema });
export const catalogDb: NodePgDatabase<typeof schema> = drizzle(catalogPool, { schema });
export const commerceDb: NodePgDatabase<typeof schema> = drizzle(commercePool, { schema });
export const libraryDb: NodePgDatabase<typeof schema> = drizzle(libraryPool, { schema });

// General Master Write / Read Replica Pools for backward compatibility & single-DB mode
const masterConnectionString =
  process.env.POSTGRES_MASTER_URL ||
  process.env.DATABASE_URL ||
  'postgresql://postgres:postgrespassword@localhost:5432/hathor';

const replicaConnectionString =
  process.env.POSTGRES_REPLICA_URL || masterConnectionString;

export const masterPool = new Pool({ connectionString: masterConnectionString });
export const replicaPool = new Pool({ connectionString: replicaConnectionString });

export const db: NodePgDatabase<typeof schema> = drizzle(masterPool, { schema });
export const dbRead: NodePgDatabase<typeof schema> = drizzle(replicaPool, { schema });
