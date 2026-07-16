import 'dotenv/config';
import { drizzle } from 'drizzle-orm/node-postgres';
import pg from 'pg';
import * as schema from './schema.js';

const { Pool } = pg;

const connectionString = process.env.AUTH_DB_URL;

if (!connectionString) {
  throw new Error('AUTH_DB_URL is required');
}

export const authPool = new Pool({ connectionString });
export const authDb = drizzle(authPool, { schema });
