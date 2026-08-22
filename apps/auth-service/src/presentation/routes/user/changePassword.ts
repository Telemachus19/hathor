import { Response } from 'express';
import { randomUUID } from 'node:crypto';
import { eq } from 'drizzle-orm';
import { authDb } from '../../../infrastructure/db/client.js';
import { users } from '../../../infrastructure/db/schema.js';
import { hashPassword, verifyPassword } from '../../../domain/password.js';
import { AuthenticatedRequest } from '../../middlewares/auth.js';

export async function changePasswordHandler(req: AuthenticatedRequest, res: Response) {
  const correlationId = (req.headers['x-correlation-id'] as string) || randomUUID();
  const { currentPassword, newPassword } = req.body;

  if (!req.user) {
    return res.status(401).json({
      success: false,
      error: {
        code: 'UNAUTHENTICATED',
        message: 'Authentication required',
        correlationId,
      },
    });
  }

  if (!currentPassword || typeof currentPassword !== 'string') {
    return res.status(422).json({
      success: false,
      error: {
        code: 'VALIDATION_FAILED',
        message: 'Current password is required',
        correlationId,
      },
    });
  }

  if (!newPassword || typeof newPassword !== 'string' || newPassword.length < 8) {
    return res.status(422).json({
      success: false,
      error: {
        code: 'VALIDATION_FAILED',
        message: 'New password must be at least 8 characters long',
        correlationId,
      },
    });
  }

  try {
    const [user] = await authDb
      .select()
      .from(users)
      .where(eq(users.id, req.user.id))
      .limit(1);

    if (!user) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'USER_NOT_FOUND',
          message: 'User account not found',
          correlationId,
        },
      });
    }

    if (user.passwordHash) {
      const isCurrentValid = await verifyPassword(currentPassword, user.passwordHash);
      if (!isCurrentValid) {
        return res.status(401).json({
          success: false,
          error: {
            code: 'INVALID_CREDENTIALS',
            message: 'Current password is incorrect',
            correlationId,
          },
        });
      }
    }

    const newHash = await hashPassword(newPassword);

    await authDb
      .update(users)
      .set({
        passwordHash: newHash,
        updatedAt: new Date(),
      })
      .where(eq(users.id, req.user.id));

    return res.status(200).json({
      success: true,
      data: {
        message: 'Password changed successfully',
      },
    });
  } catch (error: any) {
    console.error('Change password error:', error);
    return res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to update password',
        correlationId,
      },
    });
  }
}
