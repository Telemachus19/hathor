import { Response } from 'express';
import { randomUUID } from 'node:crypto';
import { eq } from 'drizzle-orm';
import { authDb } from '../../../infrastructure/db/client.js';
import { users } from '../../../infrastructure/db/schema.js';
import { AuthenticatedRequest } from '../../middlewares/auth.js';

export async function changeUserStatusHandler(req: AuthenticatedRequest, res: Response) {
  const correlationId = (req.headers['x-correlation-id'] as string) || randomUUID();
  const { userId } = req.params;
  const { status } = req.body;

  // 1. Authorization: Only admins can change status
  if (!req.user || !req.user.roles.includes('admin')) {
    return res.status(403).json({
      success: false,
      error: {
        code: 'FORBIDDEN',
        message: 'Only administrators are allowed to change user status',
        correlationId,
      },
    });
  }

  // Safeguard: Prevent administrators from suspending their own accounts
  if (req.user.id === userId && status !== 'active') {
    return res.status(400).json({
      success: false,
      error: {
        code: 'SELF_DISABLE_REJECTED',
        message: 'Administrators are not allowed to suspend/ban their own accounts',
        correlationId,
      },
    });
  }

  if (!['active', 'suspended', 'banned'].includes(status)) {
    return res.status(422).json({
      success: false,
      error: {
        code: 'VALIDATION_FAILED',
        message: 'Invalid status provided',
        correlationId,
      },
    });
  }

  try {
    const [targetUser] = await authDb.select().from(users).where(eq(users.id, userId)).limit(1);

    if (!targetUser) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'USER_NOT_FOUND',
          message: `User with ID ${userId} was not found`,
          correlationId,
        },
      });
    }

    // Increment authorizationVersion if suspending/banning to revoke active sessions
    const nextAuthVersion =
      status !== 'active' ? targetUser.authorizationVersion + 1 : targetUser.authorizationVersion;

    await authDb
      .update(users)
      .set({
        status,
        authorizationVersion: nextAuthVersion,
      })
      .where(eq(users.id, userId));

    return res.status(204).send();
  } catch (error) {
    console.error('Account status change error:', error);
    return res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: 'An unexpected error occurred while changing account status',
        correlationId,
      },
    });
  }
}
