import { Request, Response } from 'express';
import { randomUUID, createHash } from 'node:crypto';
import { eq, sql } from 'drizzle-orm';
import { authDb } from '../../../infrastructure/db/client.js';
import { users, refreshTokenFamilies, refreshTokens } from '../../../infrastructure/db/schema.js';

export async function logoutHandler(req: Request, res: Response) {
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
    const tokenHash = createHash('sha256').update(rawRefreshToken).digest('hex');

    // 1. Find token and family
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
      // Clear cookie anyway to prevent loops
      res.clearCookie('refreshToken', {
        path: '/api/v1/user',
      });
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

    // 2. Perform logout updates in a transaction
    await authDb.transaction(async (tx) => {
      // Revoke the refresh token family
      await tx
        .update(refreshTokenFamilies)
        .set({ revoked: true })
        .where(eq(refreshTokenFamilies.id, family.id));

      // Increment authorization_version to invalidate outstanding access JWTs
      await tx
        .update(users)
        .set({
          authorizationVersion: sql`${users.authorizationVersion} + 1`,
        })
        .where(eq(users.id, token.userId));
    });

    // 3. Clear cookie
    res.clearCookie('refreshToken', {
      path: '/api/v1/user',
    });

    // 4. Return 204 No Content
    return res.status(204).end();
  } catch (error) {
    console.error('Logout error:', error);
    return res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: 'An unexpected error occurred during logout',
        correlationId,
      },
    });
  }
}
