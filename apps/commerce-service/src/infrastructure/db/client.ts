import 'dotenv/config';
import { drizzle } from 'drizzle-orm/node-postgres';
import pg from 'pg';
import * as schema from './schema.js';

const { Pool } = pg;

const connectionString = process.env.COMMERCE_DB_URL;

if (!connectionString) {
  throw new Error('COMMERCE_DB_URL is required');
}

export const commercePool = new Pool({ connectionString });
export const commerceDb = drizzle(commercePool, { schema });
