import { migrate } from 'drizzle-orm/node-postgres/migrator';
import { commerceDb, commercePool } from './client.js';

async function migrateDatabase() {
  try {
    await migrate(commerceDb, { migrationsFolder: './drizzle' });
    console.log('Commerce database migrations completed successfully!');
  } catch (error) {
    console.error('Error during commerce database migration:', error);
    process.exitCode = 1;
  } finally {
    await commercePool.end();
  }
}

void migrateDatabase();
