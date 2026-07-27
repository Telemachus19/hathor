import { Request, Response } from 'express';
import { randomUUID, randomBytes, createHash } from 'node:crypto';
import { eq } from 'drizzle-orm';
import { authDb } from '../../../infrastructure/db/client.js';
import { users, refreshTokenFamilies, refreshTokens } from '../../../infrastructure/db/schema.js';
import { generateAccessToken } from '../../../domain/token.js';

export async function refreshHandler(req: Request, res: Response) {
  const correlationId = (req.headers['x-correlation-id'] as string) || randomUUID();
  const rawRefreshToken = req.cookies.refreshToken;

  if (!rawRefreshToken || typeof rawRefreshToken !== 'string') {
    return res.status(401).json({
      success: false,
      error: {
        code: 'UNAUTHENTICATED',
        message: 'Refresh token cookie is missing',
        correlationId,
      },
    });
  }

  try {
    // 1. Hash the token to look it up
    const tokenHash = createHash('sha256').update(rawRefreshToken).digest('hex');

    // 2. Query token and family
    const [result] = await authDb
      .select({
        token: refreshTokens,
        family: refreshTokenFamilies,
      })
      .from(refreshTokens)
      .innerJoin(refreshTokenFamilies, eq(refreshTokens.familyId, refreshTokenFamilies.id))
      .where(eq(refreshTokens.tokenHash, tokenHash))
      .limit(1);

    if (!result) {
      return res.status(401).json({
        success: false,
        error: {
          code: 'UNAUTHENTICATED',
          message: 'Invalid refresh token',
          correlationId,
        },
      });
    }

    const { token, family } = result;

    // 3. Check if family is revoked or token is expired
    const isExpired = new Date() > new Date(token.expiresAt);
    if (family.revoked || isExpired) {
      return res.status(401).json({
        success: false,
        error: {
          code: 'UNAUTHENTICATED',
          message: 'Session is expired or revoked',
          correlationId,
        },
      });
    }

    // 4. Token Reuse Detection
    if (token.used) {
      // Revoke the entire family
      await authDb
        .update(refreshTokenFamilies)
        .set({ revoked: true })
        .where(eq(refreshTokenFamilies.id, family.id));

      return res.status(401).json({
        success: false,
        error: {
          code: 'UNAUTHENTICATED',
          message: 'Token reuse detected. Session has been revoked.',
          correlationId,
        },
      });
    }

    // 5. Query user to get current roles and authorizationVersion
    const [user] = await authDb.select().from(users).where(eq(users.id, token.userId)).limit(1);

    if (!user) {
      return res.status(401).json({
        success: false,
        error: {
          code: 'UNAUTHENTICATED',
          message: 'User not found',
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

    // 6. Rotate token: generate new token and update database in transaction
    const newRawRefreshToken = randomBytes(40).toString('hex');
    const newTokenHash = createHash('sha256').update(newRawRefreshToken).digest('hex');

    await authDb.transaction(async (tx) => {
      // Mark old token as used
      await tx.update(refreshTokens).set({ used: true }).where(eq(refreshTokens.id, token.id));

      // Insert new token in same family
      await tx.insert(refreshTokens).values({
        userId: user.id,
        familyId: family.id,
        tokenHash: newTokenHash,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
      });
    });

    // 7. Issue new access token
    const accessToken = generateAccessToken({
      id: user.id,
      roles: user.roles,
      authorizationVersion: user.authorizationVersion,
    });

    // 8. Set rotated cookie
    res.cookie('refreshToken', newRawRefreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: 'lax',
      path: '/api/v1/user',
      expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    });

    // 9. Return response
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
    console.error('Refresh error:', error);
    return res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: 'An unexpected error occurred during token refresh',
        correlationId,
      },
    });
  }
}
