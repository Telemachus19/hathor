import crypto from 'node:crypto';
import { authDb, authPool } from './client.js';
import { users } from './schema.js';

function hashPassword(password: string): string {
  const salt = 'hathor_demo_salt';
  return crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');
}

async function seed() {
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

  try {
    for (const user of defaultUsers) {
      await authDb.insert(users).values(user).onConflictDoNothing({ target: users.email });
    }

    console.log('Auth database seeding completed successfully!');
  } catch (error) {
    console.error('Error during auth database seeding:', error);
    process.exitCode = 1;
  } finally {
    await authPool.end();
  }
}

void seed();
