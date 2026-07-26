import { Router, Request, Response } from 'express';
import { randomUUID } from 'node:crypto';
import { eq } from 'drizzle-orm';
import { authDb } from '../infrastructure/db/client.js';
import { users } from '../infrastructure/db/schema.js';
import { hashPassword } from '../domain/password.js';
import { TurnstileVerifier } from '../domain/turnstile.js';

export function createUserRouter(turnstileVerifier: TurnstileVerifier): Router {
  const router = Router();

  router.post('/register', async (req: Request, res: Response) => {
    const correlationId = (req.headers['x-correlation-id'] as string) || randomUUID();
    const { email, password, displayName, captchaToken } = req.body;

    // 1. Input Validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (
      !email || typeof email !== 'string' || email.length > 255 || !emailRegex.test(email) ||
      !password || typeof password !== 'string' || password.length < 12 || password.length > 128 ||
      !displayName || typeof displayName !== 'string' || displayName.length < 3 || displayName.length > 100 ||
      !captchaToken || typeof captchaToken !== 'string' || captchaToken.length < 1 || captchaToken.length > 4096
    ) {
      return res.status(422).json({
        success: false,
        error: {
          code: 'VALIDATION_FAILED',
          message: 'Invalid registration request inputs',
          correlationId,
        },
      });
    }

    try {
      // 2. Verify Turnstile
      const ip = (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress;
      const isCaptchaValid = await turnstileVerifier.verify(captchaToken, ip);
      if (!isCaptchaValid) {
        return res.status(422).json({
          success: false,
          error: {
            code: 'VALIDATION_FAILED',
            message: 'Invalid CAPTCHA token',
            correlationId,
          },
        });
      }

      // 3. Check for Existing User
      const normalizedEmail = email.toLowerCase();
      const existingUsers = await authDb
        .select()
        .from(users)
        .where(eq(users.email, normalizedEmail))
        .limit(1);

      if (existingUsers.length > 0) {
        return res.status(409).json({
          success: false,
          error: {
            code: 'EMAIL_ALREADY_EXISTS',
            message: 'A user with this email already exists',
            correlationId,
          },
        });
      }

      // 4. Hash password
      const passwordHash = await hashPassword(password);

      // 5. Create new user (forced to 'gamer' role)
      const [newUser] = await authDb
        .insert(users)
        .values({
          email: normalizedEmail,
          passwordHash,
          displayName,
          roles: ['gamer'],
        })
        .returning();

      return res.status(201).json({
        id: newUser.id,
        email: newUser.email,
        displayName: newUser.displayName,
        roles: newUser.roles,
      });
    } catch (error) {
      console.error('Registration error:', error);
      return res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_SERVER_ERROR',
          message: 'An unexpected error occurred during registration',
          correlationId,
        },
      });
    }
  });

  return router;
}
