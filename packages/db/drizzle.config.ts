import { defineConfig } from 'drizzle-kit';
import * as dotenv from 'dotenv';

dotenv.config();

export default defineConfig({
  schema: './src/schema/index.ts',
  out: './src/migrations',
  driver: 'pg',
  dbCredentials: {
    connectionString: process.env.POSTGRES_MASTER_URL || 'postgresql://postgres:postgres@localhost:5432/hathor',
  },
  schemaFilter: ['auth', 'catalog', 'commerce', 'library'],
});
