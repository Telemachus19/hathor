import 'dotenv/config';
import { drizzle } from 'drizzle-orm/node-postgres';
import pg from 'pg';
import * as schema from './schema.js';

const { Pool } = pg;

const connectionString = process.env.LIBRARY_DB_URL;

if (!connectionString) {
  throw new Error('LIBRARY_DB_URL is required');
}

export const libraryPool = new Pool({ connectionString });
export const libraryDb = drizzle(libraryPool, { schema });
