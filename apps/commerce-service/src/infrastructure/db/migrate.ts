import process from 'node:process';
import { migrate } from 'drizzle-orm/node-postgres/migrator';
import { commerceDb } from './client.js';

export async function runMigrations() {
  try {
    await migrate(commerceDb, { migrationsFolder: './drizzle' });
    console.log('[CommerceService] Database migrations completed successfully!');
  } catch (error) {
    console.error('[CommerceService] Error during database migration:', error);
    throw error;
  }
}

const isDirectRun =
  Boolean(process.argv[1]) &&
  (process.argv[1].includes('migrate.ts') || process.argv[1].includes('migrate.js'));

if (isDirectRun) {
  runMigrations().catch((err) => {
    console.error('[CommerceService] Direct migration execution failed:', err);
    process.exit(1);
  });
}
