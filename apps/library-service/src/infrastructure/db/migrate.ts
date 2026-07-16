import { migrate } from 'drizzle-orm/node-postgres/migrator';
import { libraryDb, libraryPool } from './client.js';

async function migrateDatabase() {
  try {
    await migrate(libraryDb, { migrationsFolder: './drizzle' });
    console.log('Library database migrations completed successfully!');
  } catch (error) {
    console.error('Error during library database migration:', error);
    process.exitCode = 1;
  } finally {
    await libraryPool.end();
  }
}

void migrateDatabase();
