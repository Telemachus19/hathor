import { migrate } from 'drizzle-orm/node-postgres/migrator';
import { catalogDb, catalogPool } from './client.js';

async function migrateDatabase() {
  try {
    await migrate(catalogDb, { migrationsFolder: './drizzle' });
    console.log('Catalog database migrations completed successfully!');
  } catch (error) {
    console.error('Error during catalog database migration:', error);
    process.exitCode = 1;
  } finally {
    await catalogPool.end();
  }
}

void migrateDatabase();
