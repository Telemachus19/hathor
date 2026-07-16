import { catalogDb, catalogPool } from './client.js';
import { tags } from './schema.js';

async function seed() {
  const defaultTags = [
    { name: 'Indie', slug: 'indie' },
    { name: 'Action', slug: 'action' },
    { name: 'RPG', slug: 'rpg' },
    { name: 'Strategy', slug: 'strategy' },
  ];

  try {
    for (const tag of defaultTags) {
      await catalogDb.insert(tags).values(tag).onConflictDoNothing({ target: tags.slug });
    }

    console.log('Catalog database seeding completed successfully!');
  } catch (error) {
    console.error('Error during catalog database seeding:', error);
    process.exitCode = 1;
  } finally {
    await catalogPool.end();
  }
}

void seed();
