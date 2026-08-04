import { Request, Response } from 'express';
import { randomUUID } from 'node:crypto';
import { eq } from 'drizzle-orm';
import { authDb } from '../../../infrastructure/db/client.js';
import { users } from '../../../infrastructure/db/schema.js';
import { hashPassword } from '../../../domain/password.js';
import { TurnstileVerifier } from '../../../domain/turnstile.js';
import { ZodSchemas } from '@hathor/contracts';

export function registerHandler(turnstileVerifier: TurnstileVerifier) {
  return async (req: Request, res: Response) => {
    const correlationId = (req.headers['x-correlation-id'] as string) || randomUUID();
    // 1. Input Validation via OpenAPI-generated Zod Schema
    const parseResult = ZodSchemas.RegisterRequest.safeParse(req.body);
    if (!parseResult.success) {
      const details: Record<string, string> = {};
      for (const issue of parseResult.error.issues) {
        const path = issue.path[0];
        if (path && typeof path === 'string' && !details[path]) {
          details[path] = issue.message;
        }
      }

      return res.status(422).json({
        success: false,
        error: {
          code: 'VALIDATION_FAILED',
          message: 'Invalid registration request inputs',
          correlationId,
          details,
        },
      });
    }

    const { email, password, displayName, captchaToken } = parseResult.data;

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
            details: { captchaToken: 'Invalid CAPTCHA token' },
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
            details: {
              email: 'A user with this email address already exists.',
            },
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
  };
}
