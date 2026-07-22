import { createRequire } from 'node:module';

const require = createRequire(new URL('../../apps/auth-service/package.json', import.meta.url));
const { Client } = require('pg');

const checks = [
  [process.env.AUTH_DB_URL, 'select count(*)::int as count from auth.users', 3, 'auth users'],
  [
    process.env.CATALOG_DB_URL,
    'select count(*)::int as count from catalog.tags',
    4,
    'catalog tags',
  ],
  [
    process.env.COMMERCE_DB_URL,
    "select count(*)::int as count from information_schema.tables where table_schema = 'commerce'",
    3,
    'commerce tables',
  ],
  [
    process.env.LIBRARY_DB_URL,
    "select count(*)::int as count from information_schema.tables where table_schema = 'library'",
    2,
    'library tables',
  ],
];

for (const [connectionString, query, expectedCount, label] of checks) {
  const client = new Client({ connectionString });
  await client.connect();
  const result = await client.query(query);
  await client.end();

  if (result.rows[0].count !== expectedCount) {
    throw new Error(`${label}: expected ${expectedCount}, received ${result.rows[0].count}`);
  }
}

console.log('Isolated test migrations and fixtures verified successfully.');
