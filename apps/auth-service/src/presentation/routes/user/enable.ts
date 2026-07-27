import { Response } from 'express';
import { randomUUID } from 'node:crypto';
import { eq } from 'drizzle-orm';
import { authDb } from '../../../infrastructure/db/client.js';
import { users } from '../../../infrastructure/db/schema.js';
import { AuthenticatedRequest } from '../../middlewares/auth.js';

export async function enableAccountHandler(req: AuthenticatedRequest, res: Response) {
  const correlationId = (req.headers['x-correlation-id'] as string) || randomUUID();
  const { userId } = req.params;

  // 1. Authorization: Only admins can enable accounts
  if (!req.user || !req.user.roles.includes('admin')) {
    return res.status(403).json({
      success: false,
      error: {
        code: 'FORBIDDEN',
        message: 'Only administrators are allowed to enable accounts',
        correlationId,
      },
    });
  }

  // 2. Validate userId format (UUID)
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (!uuidRegex.test(userId)) {
    return res.status(422).json({
      success: false,
      error: {
        code: 'VALIDATION_FAILED',
        message: 'Invalid user ID format. Must be a valid UUID.',
        correlationId,
      },
    });
  }

  try {
    // 3. Fetch target user
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

    // 4. Update disabled status to false and increment authorizationVersion
    const nextAuthVersion = targetUser.authorizationVersion + 1;
    await authDb
      .update(users)
      .set({
        disabled: false,
        authorizationVersion: nextAuthVersion,
      })
      .where(eq(users.id, userId));

    return res.status(200).json({
      success: true,
      message: `Account enabled successfully, and sessions for user ${userId} have been updated.`,
    });
  } catch (error) {
    console.error('Account enable error:', error);
    return res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: 'An unexpected error occurred while enabling the account',
        correlationId,
      },
    });
  }
}
