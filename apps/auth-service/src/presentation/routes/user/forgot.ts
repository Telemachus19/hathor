import { Request, Response } from 'express';
import { randomUUID, randomBytes, createHash } from 'node:crypto';
import { eq } from 'drizzle-orm';
import { authDb } from '../../../infrastructure/db/client.js';
import { users, passwordResetTokens } from '../../../infrastructure/db/schema.js';
import { createEmailService } from '../../../infrastructure/email/email-service.js';

const emailService = createEmailService();

// Simple in-memory rate limiting map for forgot password requests (email -> timestamp)
const rateLimitMap = new Map<string, number>();
const RATE_LIMIT_WINDOW_MS = 60 * 1000; // 1 request per minute per email

export async function forgotPasswordHandler(req: Request, res: Response) {
  const correlationId = (req.headers['x-correlation-id'] as string) || randomUUID();
  const { email } = req.body;

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email || typeof email !== 'string' || email.length > 255 || !emailRegex.test(email)) {
    return res.status(422).json({
      success: false,
      error: {
        code: 'VALIDATION_FAILED',
        message: 'Invalid email address format',
        correlationId,
      },
    });
  }

  const normalizedEmail = email.toLowerCase().trim();

  // Rate Limiting Check
  const lastRequestTime = rateLimitMap.get(normalizedEmail);
  const now = Date.now();
  if (lastRequestTime && now - lastRequestTime < RATE_LIMIT_WINDOW_MS) {
    return res.status(429).json({
      success: false,
      error: {
        code: 'TOO_MANY_REQUESTS',
        message: 'Please wait a minute before requesting another password reset.',
        correlationId,
      },
    });
  }
  rateLimitMap.set(normalizedEmail, now);

  try {
    const [user] = await authDb
      .select()
      .from(users)
      .where(eq(users.email, normalizedEmail))
      .limit(1);

    if (user && !user.disabled) {
      // 1. Generate cryptographically secure single-use raw token
      const rawToken = randomBytes(32).toString('hex');
      const tokenHash = createHash('sha256').update(rawToken).digest('hex');
      const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes expiration

      // 2. Save token hash in database
      await authDb.insert(passwordResetTokens).values({
        userId: user.id,
        tokenHash,
        expiresAt,
        used: false,
      });

      // 3. Dispatch reset email
      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
      const resetUrl = `${frontendUrl}/reset-password?token=${rawToken}`;
      await emailService.sendPasswordResetEmail({
        to: user.email,
        resetUrl,
        displayName: user.displayName,
      });
    }

    // Always return generic success message to prevent account enumeration attacks
    return res.status(200).json({
      success: true,
      message: 'If an account exists with that email address, a password reset link has been sent.',
    });
  } catch (error) {
    console.error('Forgot password error:', error);
    return res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: 'An unexpected error occurred during password reset request',
        correlationId,
      },
    });
  }
}
