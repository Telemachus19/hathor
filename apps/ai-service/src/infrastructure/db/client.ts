import 'dotenv/config';
import { drizzle } from 'drizzle-orm/node-postgres';
import pg from 'pg';
import * as schema from './schema.js';

const { Pool } = pg;

const connectionString = process.env.CATALOG_DB_URL;

if (!connectionString) {
  console.warn('[AI Service] WARNING: CATALOG_DB_URL is not set; database features will be disabled.');
}

export const catalogPool = new Pool({
  connectionString: connectionString || 'postgresql://catalog_app:dummy@catalog-postgres:5432/catalog',
});

export const catalogDb = drizzle(catalogPool, { schema });
