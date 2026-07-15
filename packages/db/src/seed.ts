import * as dotenv from 'dotenv';
import crypto from 'node:crypto';
import { authDb, catalogDb, authPool, catalogPool } from './client.js';
import { tags } from './schema/catalog.js';
import { users } from './schema/auth.js';

dotenv.config();

function hashPassword(password: string): string {
  const salt = 'hathor_demo_salt';
  return crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');
}

async function seed() {
  console.log('🌱 Starting database seeding across service databases...');

  try {
    // 1. Seed Tags in catalog_db
    const defaultTags = [
      { name: 'Indie', slug: 'indie' },
      { name: 'Action', slug: 'action' },
      { name: 'RPG', slug: 'rpg' },
      { name: 'Strategy', slug: 'strategy' },
    ];

    console.log('Inserting default tags into catalog_db...');
    for (const tag of defaultTags) {
      await catalogDb.insert(tags).values(tag).onConflictDoNothing({ target: tags.slug });
    }

    // 2. Seed Demo Users in auth_db
    const defaultUsers = [
      {
        email: 'gamer@hathor.com',
        passwordHash: hashPassword('Gamer123!'),
        displayName: 'Demo Gamer',
        roles: ['gamer'],
      },
      {
        email: 'creator@hathor.com',
        passwordHash: hashPassword('Creator123!'),
        displayName: 'Demo Creator',
        roles: ['gamer', 'creator'],
      },
      {
        email: 'admin@hathor.com',
        passwordHash: hashPassword('Admin123!'),
        displayName: 'Demo Admin',
        roles: ['gamer', 'creator', 'admin'],
      },
    ];

    console.log('Inserting demo users into auth_db...');
    for (const user of defaultUsers) {
      await authDb.insert(users).values(user).onConflictDoNothing({ target: users.email });
    }

    console.log('✅ Seeding completed successfully!');
  } catch (error) {
    console.error('❌ Error during database seeding:', error);
  } finally {
    await authPool.end();
    await catalogPool.end();
  }
}

seed();
