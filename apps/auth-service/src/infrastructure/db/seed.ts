import { authDb, authPool } from './client.js';
import { users } from './schema.js';
import { hashPassword } from '../../domain/password.js';

async function seed() {
  const defaultUsers = [
    {
      email: 'gamer@hathor.com',
      passwordHash: await hashPassword('Gamer123!'),
      displayName: 'Demo Gamer',
      roles: ['gamer'],
    },
    {
      email: 'creator@hathor.com',
      passwordHash: await hashPassword('Creator123!'),
      displayName: 'Demo Creator',
      roles: ['gamer', 'creator'],
    },
    {
      email: 'admin@hathor.com',
      passwordHash: await hashPassword('Admin123!'),
      displayName: 'Demo Admin',
      roles: ['gamer', 'creator', 'admin'],
    },
  ];

  try {
    for (const user of defaultUsers) {
      await authDb
        .insert(users)
        .values(user)
        .onConflictDoUpdate({
          target: users.email,
          set: {
            passwordHash: user.passwordHash,
            displayName: user.displayName,
            roles: user.roles,
          },
        });
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
