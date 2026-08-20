import process from 'node:process';
import path from 'node:path';
import fs from 'node:fs';
import { migrate } from 'drizzle-orm/node-postgres/migrator';
import { commerceDb } from './client.js';

function getMigrationsFolder(): string {
  const candidates = [
    './drizzle',
    './apps/commerce-service/drizzle',
    path.resolve(process.cwd(), 'drizzle'),
    path.resolve(process.cwd(), 'apps/commerce-service/drizzle'),
  ];
  for (const candidate of candidates) {
    if (fs.existsSync(candidate) && fs.existsSync(path.join(candidate, 'meta/_journal.json'))) {
      return candidate;
    }
  }
  return './drizzle';
}

export async function runMigrations() {
  try {
    const migrationsFolder = getMigrationsFolder();
    await migrate(commerceDb, { migrationsFolder });
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
