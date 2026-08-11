import { migrate } from 'drizzle-orm/node-postgres/migrator';
import { commerceDb } from './client.js';

export async function runMigrations() {
  try {
    await migrate(commerceDb, { migrationsFolder: './drizzle' });
    console.log('[CommerceService] Database migrations completed successfully!');
  } catch (error) {
    console.error('[CommerceService] Error during database migration:', error);
  }
}
