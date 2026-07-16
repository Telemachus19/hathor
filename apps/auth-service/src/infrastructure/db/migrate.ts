import { migrate } from 'drizzle-orm/node-postgres/migrator';
import { authDb, authPool } from './client.js';

async function migrateDatabase() {
  try {
    await migrate(authDb, { migrationsFolder: './drizzle' });
    console.log('Auth database migrations completed successfully!');
  } catch (error) {
    console.error('Error during auth database migration:', error);
    process.exitCode = 1;
  } finally {
    await authPool.end();
  }
}

void migrateDatabase();
