import { eq, sql } from 'drizzle-orm';
import { randomUUID } from 'node:crypto';
import { basename } from 'node:path';
import { authDb } from '../infrastructure/db/client.js';
import { users, roleChangeAudit } from '../infrastructure/db/schema.js';

interface BootstrapParams {
  email: string;
  secret: string;
  envSecret: string | undefined;
  db: any;
}

/**
 * Core testable logic for the One-Time Admin Bootstrap.
 */
export async function runBootstrap({
  email,
  secret,
  envSecret,
  db,
}: BootstrapParams): Promise<{ success: boolean; message: string }> {
  // 1. Check if bootstrap secret is configured in environment
  if (!envSecret) {
    return {
      success: false,
      message:
        'Bootstrap error: INITIAL_ADMIN_BOOTSTRAP_SECRET is not configured in the environment.',
    };
  }

  // 2. Verify secret
  if (secret !== envSecret) {
    return {
      success: false,
      message: 'Bootstrap error: Invalid bootstrap secret provided.',
    };
  }

  try {
    const result = await db.transaction(async (tx: any) => {
      // 3. Lock check: Check if any admin already exists in the database
      const existingAdmins = await tx
        .select()
        .from(users)
        .where(sql`'admin' = ANY(${users.roles})`)
        .limit(1);

      if (existingAdmins.length > 0) {
        throw new Error('BOOTSTRAP_LOCKED');
      }

      // 4. Find target user
      const normalizedEmail = email.trim().toLowerCase();
      const [targetUser] = await tx
        .select()
        .from(users)
        .where(eq(users.email, normalizedEmail))
        .limit(1);

      if (!targetUser) {
        throw new Error('USER_NOT_FOUND');
      }

      // 5. Double check if they are already admin
      if (targetUser.roles.includes('admin')) {
        throw new Error('ALREADY_ADMIN');
      }

      const nextAuthVersion = targetUser.authorizationVersion + 1;

      // Update target user roles and auth version
      await tx
        .update(users)
        .set({
          roles: [...targetUser.roles, 'admin'],
          authorizationVersion: nextAuthVersion,
        })
        .where(eq(users.id, targetUser.id));

      // Write audit log entry (actorId is null because this is a CLI system bootstrap)
      await tx.insert(roleChangeAudit).values({
        actorId: null,
        targetId: targetUser.id,
        change: 'Granted initial admin role via one-time bootstrap CLI command',
        authorizationVersion: nextAuthVersion,
        correlationId: randomUUID(),
      });

      return {
        success: true,
        message: `Successfully bootstrapped user "${email}" with initial admin role.`,
      };
    });

    return result;
  } catch (error: any) {
    if (error.message === 'BOOTSTRAP_LOCKED') {
      return {
        success: false,
        message: 'Bootstrap lock: An admin user already exists. Subsequent runs are disabled.',
      };
    }
    if (error.message === 'USER_NOT_FOUND') {
      return {
        success: false,
        message: `Bootstrap error: Target user with email "${email}" was not found.`,
      };
    }
    if (error.message === 'ALREADY_ADMIN') {
      return {
        success: false,
        message: `Bootstrap error: User with email "${email}" is already an admin.`,
      };
    }

    console.error('Bootstrap command failed:', error);
    return {
      success: false,
      message: `Bootstrap error: An unexpected error occurred: ${error.message || error}`,
    };
  }
}

// Self-executing CLI wrapper when run directly from Node
const isMain =
  process.argv[1] && basename(process.argv[1]).replace(/\.[jt]sx?$/, '') === 'bootstrap-admin';
if (isMain) {
  const runCli = async () => {
    // Basic argument parsing: --email <email> --secret <secret>
    let email = '';
    let secret = '';

    for (let i = 2; i < process.argv.length; i++) {
      if (process.argv[i] === '--email' && process.argv[i + 1]) {
        email = process.argv[i + 1];
      }
      if (process.argv[i] === '--secret' && process.argv[i + 1]) {
        secret = process.argv[i + 1];
      }
    }

    if (!email || !secret) {
      console.error('Usage: tsx src/commands/bootstrap-admin.ts --email <email> --secret <secret>');
      process.exit(1);
    }

    const envSecret = process.env.INITIAL_ADMIN_BOOTSTRAP_SECRET;

    console.log(`Starting admin bootstrap for target gamer: "${email}"...`);
    const result = await runBootstrap({ email, secret, envSecret, db: authDb });
    delete process.env.INITIAL_ADMIN_BOOTSTRAP_SECRET;

    if (result.success) {
      console.log('✅', result.message);
      process.exit(0);
    } else {
      console.error('❌', result.message);
      process.exit(1);
    }
  };

  runCli().catch((err) => {
    console.error('Unhandled CLI execution error:', err);
    process.exit(1);
  });
}
