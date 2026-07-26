import { Request, Response } from 'express';
import { randomUUID } from 'node:crypto';
import { eq } from 'drizzle-orm';
import { authDb } from '../../../infrastructure/db/client.js';
import { users } from '../../../infrastructure/db/schema.js';
import { hashPassword } from '../../../domain/password.js';

export async function passwordResetHandler(req: Request, res: Response) {
  const correlationId = (req.headers['x-correlation-id'] as string) || randomUUID();
  const { email, newPassword } = req.body;

  // 1. Input Validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (
    !email || typeof email !== 'string' || email.length > 255 || !emailRegex.test(email) ||
    !newPassword || typeof newPassword !== 'string' || newPassword.length < 12 || newPassword.length > 128
  ) {
    return res.status(422).json({
      success: false,
      error: {
        code: 'VALIDATION_FAILED',
        message: 'Invalid email or password constraints',
        correlationId,
      },
    });
  }

  try {
    const normalizedEmail = email.toLowerCase();

    // 2. Fetch User
    const [user] = await authDb
      .select()
      .from(users)
      .where(eq(users.email, normalizedEmail))
      .limit(1);

    if (!user) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'USER_NOT_FOUND',
          message: 'No user registered with this email address',
          correlationId,
        },
      });
    }

    if (user.disabled) {
      return res.status(403).json({
        success: false,
        error: {
          code: 'FORBIDDEN',
          message: 'This account has been disabled',
          correlationId,
        },
      });
    }

    // 3. Hash the new password
    const newPasswordHash = await hashPassword(newPassword);

    // 4. Update password and increment authorizationVersion
    const nextAuthVersion = user.authorizationVersion + 1;
    await authDb
      .update(users)
      .set({
        passwordHash: newPasswordHash,
        authorizationVersion: nextAuthVersion,
      })
      .where(eq(users.id, user.id));

    return res.status(200).json({
      success: true,
      message: 'Password reset successfully, and active sessions have been invalidated.',
    });
  } catch (error) {
    console.error('Password reset error:', error);
    return res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: 'An unexpected error occurred during password reset',
        correlationId,
      },
    });
  }
}
