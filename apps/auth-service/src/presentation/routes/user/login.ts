import { Request, Response } from 'express';
import { randomUUID, randomBytes, createHash } from 'node:crypto';
import { eq } from 'drizzle-orm';
import { authDb } from '../../../infrastructure/db/client.js';
import { users, refreshTokenFamilies, refreshTokens } from '../../../infrastructure/db/schema.js';
import { verifyPassword } from '../../../domain/password.js';
import { generateAccessToken } from '../../../domain/token.js';

export async function loginHandler(req: Request, res: Response) {
  const correlationId = (req.headers['x-correlation-id'] as string) || randomUUID();
  const { email, password } = req.body;

  if (!email || typeof email !== 'string' || !password || typeof password !== 'string') {
    return res.status(401).json({
      success: false,
      error: {
        code: 'UNAUTHENTICATED',
        message: 'Invalid email or password format',
        correlationId,
      },
    });
  }

  try {
    const normalizedEmail = email.toLowerCase();

    // 1. Find user
    const [user] = await authDb
      .select()
      .from(users)
      .where(eq(users.email, normalizedEmail))
      .limit(1);

    if (!user) {
      return res.status(401).json({
        success: false,
        error: {
          code: 'UNAUTHENTICATED',
          message: 'Invalid email or password',
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

    if (!user.passwordHash) {
      return res.status(401).json({
        success: false,
        error: {
          code: 'UNAUTHENTICATED',
          message: 'This account was created with Google OAuth. Please sign in with Google.',
          correlationId,
        },
      });
    }

    // 2. Verify password using Argon2id
    const isPasswordValid = await verifyPassword(password, user.passwordHash);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        error: {
          code: 'UNAUTHENTICATED',
          message: 'Invalid email or password',
          correlationId,
        },
      });
    }

    // 3. Issue Access Token
    const accessToken = generateAccessToken({
      id: user.id,
      roles: user.roles,
      authorizationVersion: user.authorizationVersion,
    });

    // 4. Generate opaque refresh token and family
    const rawRefreshToken = randomBytes(40).toString('hex');
    const tokenHash = createHash('sha256').update(rawRefreshToken).digest('hex');

    // Save family and token to DB in a transaction
    await authDb.transaction(async (tx) => {
      const [family] = await tx
        .insert(refreshTokenFamilies)
        .values({
          userId: user.id,
        })
        .returning();

      await tx.insert(refreshTokens).values({
        userId: user.id,
        familyId: family.id,
        tokenHash,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
      });
    });

    // 5. Set HTTP-Only Cookie scoped to refresh route
    res.cookie('refreshToken', rawRefreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: 'lax',
      path: '/api/v1/user',
      expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    });

    // 6. Return response
    return res.status(200).json({
      accessToken,
      user: {
        id: user.id,
        email: user.email,
        displayName: user.displayName,
        roles: user.roles,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: 'An unexpected error occurred during login',
        correlationId,
      },
    });
  }
}
