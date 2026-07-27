import { Request, Response } from 'express';
import { randomUUID, createHash } from 'node:crypto';
import { eq, and, gt } from 'drizzle-orm';
import { authDb } from '../../../infrastructure/db/client.js';
import { users, passwordResetTokens } from '../../../infrastructure/db/schema.js';
import { hashPassword } from '../../../domain/password.js';

export async function passwordResetHandler(req: Request, res: Response) {
  const correlationId = (req.headers['x-correlation-id'] as string) || randomUUID();
  const { token, newPassword } = req.body;

  // 1. Input Validation
  if (
    !token ||
    typeof token !== 'string' ||
    !newPassword ||
    typeof newPassword !== 'string' ||
    newPassword.length < 12 ||
    newPassword.length > 128
  ) {
    return res.status(422).json({
      success: false,
      error: {
        code: 'VALIDATION_FAILED',
        message: 'Password reset token is required, and new password must be between 12 and 128 characters',
        correlationId,
      },
    });
  }

  try {
    // 2. Hash raw token with SHA-256 to lookup stored record
    const tokenHash = createHash('sha256').update(token).digest('hex');
    const now = new Date();

    // 3. Find valid reset token in DB
    const [resetRecord] = await authDb
      .select()
      .from(passwordResetTokens)
      .where(
        and(
          eq(passwordResetTokens.tokenHash, tokenHash),
          eq(passwordResetTokens.used, false),
          gt(passwordResetTokens.expiresAt, now)
        )
      )
      .limit(1);

    if (!resetRecord) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_RESET_TOKEN',
          message: 'Password reset token is invalid, expired, or has already been used.',
          correlationId,
        },
      });
    }

    // 4. Fetch target User
    const [user] = await authDb
      .select()
      .from(users)
      .where(eq(users.id, resetRecord.userId))
      .limit(1);

    if (!user) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'USER_NOT_FOUND',
          message: 'Associated user account no longer exists',
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

    // 5. Hash new password & prepare next authorization version
    const newPasswordHash = await hashPassword(newPassword);
    const nextAuthVersion = user.authorizationVersion + 1;

    // 6. Perform atomic update: mark token used, update passwordHash, increment authorizationVersion
    await authDb.transaction(async (tx) => {
      await tx
        .update(passwordResetTokens)
        .set({ used: true })
        .where(eq(passwordResetTokens.id, resetRecord.id));

      await tx
        .update(users)
        .set({
          passwordHash: newPasswordHash,
          authorizationVersion: nextAuthVersion,
          updatedAt: new Date(),
        })
        .where(eq(users.id, user.id));
    });

    return res.status(200).json({
      success: true,
      message: 'Password reset successfully. Active sessions have been invalidated.',
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
