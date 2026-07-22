import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

const services = ['auth', 'catalog', 'commerce', 'library'];
const forbiddenReferences = [
  /REFERENCES\s+"auth"\./i,
  /REFERENCES\s+"catalog"\./i,
  /REFERENCES\s+"commerce"\./i,
  /REFERENCES\s+"library"\./i,
];

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

for (const service of services) {
  const migrationRoot = join('apps', `${service}-service`, 'drizzle');
  const journalPath = join(migrationRoot, 'meta', '_journal.json');
  assert(existsSync(journalPath), `${service} migration journal is missing`);

  const journal = JSON.parse(readFileSync(journalPath, 'utf8'));
  assert(journal.dialect === 'pg', `${service} migration journal must target PostgreSQL`);
  assert(journal.entries.length > 0, `${service} must have at least one migration`);

  for (const entry of journal.entries) {
    const migrationPath = join(migrationRoot, `${entry.tag}.sql`);
    assert(existsSync(migrationPath), `Missing migration file: ${migrationPath}`);
    const sql = readFileSync(migrationPath, 'utf8');

    for (const pattern of forbiddenReferences) {
      const referencedSchema = pattern.source.match(/"(\w+)"/)?.[1];
      if (referencedSchema !== service) {
        assert(!pattern.test(sql), `${service} migration references ${referencedSchema} schema`);
      }
    }
  }
}

console.log('Service migrations are present and contain no cross-service references.');
