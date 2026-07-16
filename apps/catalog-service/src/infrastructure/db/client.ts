import 'dotenv/config';
import { drizzle } from 'drizzle-orm/node-postgres';
import pg from 'pg';
import * as schema from './schema.js';

const { Pool } = pg;

const connectionString = process.env.CATALOG_DB_URL;

if (!connectionString) {
  throw new Error('CATALOG_DB_URL is required');
}

export const catalogPool = new Pool({ connectionString });
export const catalogDb = drizzle(catalogPool, { schema });
