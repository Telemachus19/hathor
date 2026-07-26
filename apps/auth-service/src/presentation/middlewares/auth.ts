import { Request, Response, NextFunction } from 'express';
import { eq } from 'drizzle-orm';
import { verifyAccessToken } from '../../domain/token.js';
import { authDb } from '../../infrastructure/db/client.js';
import { users } from '../../infrastructure/db/schema.js';

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
    displayName: string;
    roles: string[];
  };
}

export async function requireAuth(req: Request, res: Response, next: NextFunction) {
  const correlationId = (req.headers['x-correlation-id'] as string) || req.headers['correlation-id'] || '';
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      success: false,
      error: {
        code: 'UNAUTHENTICATED',
        message: 'Missing or invalid Authorization header',
        correlationId,
      },
    });
  }

  const token = authHeader.split(' ')[1];

  try {
    // 1. Verify token signature, alg, time bounds, issuer, and audience
    const claims = verifyAccessToken(token);

    // 2. Query user from DB to check current authorization version
    const [user] = await authDb
      .select()
      .from(users)
      .where(eq(users.id, claims.sub))
      .limit(1);

    if (!user) {
      return res.status(401).json({
        success: false,
        error: {
          code: 'UNAUTHENTICATED',
          message: 'User no longer exists',
          correlationId,
        },
      });
    }

    if (user.disabled) {
      return res.status(401).json({
        success: false,
        error: {
          code: 'UNAUTHENTICATED',
          message: 'User account is disabled',
          correlationId,
        },
      });
    }

    // 3. Check authorization version
    if (claims.authorizationVersion < user.authorizationVersion) {
      return res.status(401).json({
        success: false,
        error: {
          code: 'UNAUTHENTICATED',
          message: 'Token has been invalidated',
          correlationId,
        },
      });
    }

    // 4. Attach user object to request
    (req as AuthenticatedRequest).user = {
      id: user.id,
      email: user.email,
      displayName: user.displayName,
      roles: user.roles,
    };

    return next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      error: {
        code: 'UNAUTHENTICATED',
        message: 'Invalid or expired token',
        correlationId,
      },
    });
  }
}
