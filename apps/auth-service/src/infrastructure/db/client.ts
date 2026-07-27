import 'dotenv/config';
import { drizzle } from 'drizzle-orm/node-postgres';
import pg from 'pg';
import * as schema from './schema.js';

const { Pool } = pg;

const connectionString =
  process.env.AUTH_DB_URL ||
  (process.env.VITEST ? 'postgres://postgres:postgres@localhost:5432/hathor_auth_test' : undefined);

if (!connectionString) {
  throw new Error('AUTH_DB_URL is required');
}

export const authPool = new Pool({ connectionString });
export const authDb = drizzle(authPool, { schema });
