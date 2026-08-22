import { Response } from 'express';
import { randomUUID } from 'node:crypto';
import { eq } from 'drizzle-orm';
import { authDb } from '../../../infrastructure/db/client.js';
import { users } from '../../../infrastructure/db/schema.js';
import { AuthenticatedRequest } from '../../middlewares/auth.js';

export async function changeEmailHandler(req: AuthenticatedRequest, res: Response) {
  const correlationId = (req.headers['x-correlation-id'] as string) || randomUUID();
  const { email } = req.body;

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

  if (!email || typeof email !== 'string') {
    return res.status(422).json({
      success: false,
      error: {
        code: 'VALIDATION_FAILED',
        message: 'Email is required',
        correlationId,
      },
    });
  }

  const normalizedEmail = email.toLowerCase().trim();
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(normalizedEmail)) {
    return res.status(422).json({
      success: false,
      error: {
        code: 'VALIDATION_FAILED',
        message: 'Invalid email address format',
        correlationId,
      },
    });
  }

  try {
    const [existing] = await authDb
      .select()
      .from(users)
      .where(eq(users.email, normalizedEmail))
      .limit(1);

    if (existing && existing.id !== req.user.id) {
      return res.status(409).json({
        success: false,
        error: {
          code: 'EMAIL_ALREADY_EXISTS',
          message: 'An account with this email address already exists',
          correlationId,
        },
      });
    }

    await authDb
      .update(users)
      .set({
        email: normalizedEmail,
        updatedAt: new Date(),
      })
      .where(eq(users.id, req.user.id));

    return res.status(200).json({
      success: true,
      data: {
        id: req.user.id,
        email: normalizedEmail,
        displayName: req.user.displayName,
        roles: req.user.roles,
      },
    });
  } catch (error: any) {
    console.error('Change email error:', error);
    return res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to update email address',
        correlationId,
      },
    });
  }
}
