import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { createPublicKey } from 'node:crypto';

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    roles: string[];
  };
}

let cachedPublicKeyPem: string | null = null;

async function getPublicKey(): Promise<string> {
  if (cachedPublicKeyPem) {
    return cachedPublicKeyPem;
  }

  if (process.env.JWT_PUBLIC_KEY) {
    cachedPublicKeyPem = process.env.JWT_PUBLIC_KEY.replace(/\\n/g, '\n');
    return cachedPublicKeyPem;
  }

  const authServiceUrl = process.env.AUTH_SERVICE_URL || 'http://localhost:5001';
  const jwksUrl = `${authServiceUrl}/user/.well-known/jwks.json`;

  try {
    const response = await fetch(jwksUrl);
    if (!response.ok) {
      throw new Error(`Failed to fetch JWKS from ${jwksUrl}: ${response.statusText}`);
    }
    const data = await (response.json() as Promise<{ keys?: Array<Record<string, any>> }>);
    const key = data.keys?.[0];
    if (!key) {
      throw new Error(`No keys found in JWKS at ${jwksUrl}`);
    }

    const keyObject = createPublicKey({ key, format: 'jwk' });
    cachedPublicKeyPem = keyObject.export({ type: 'spki', format: 'pem' }) as string;
    return cachedPublicKeyPem;
  } catch (error) {
    console.error('Error fetching public key from auth-service:', error);
    throw new Error('Public key retrieval failed');
  }
}

export async function requireAuth(req: Request, res: Response, next: NextFunction) {
  const correlationId =
    (req.headers['x-correlation-id'] as string) || req.headers['correlation-id'] || '';

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
    const publicKeyPem = await getPublicKey();

    const claims = jwt.verify(token, publicKeyPem, {
      algorithms: ['RS256'],
      issuer: 'hathor-auth-service',
      audience: 'hathor-services',
    }) as any;

    if (!claims || !claims.sub) {
      return res.status(401).json({
        success: false,
        error: {
          code: 'UNAUTHENTICATED',
          message: 'Invalid token claims',
          correlationId,
        },
      });
    }

    const roles: string[] = Array.isArray(claims.roles)
      ? claims.roles
      : typeof claims.roles === 'string'
        ? [claims.roles]
        : [];

    (req as AuthenticatedRequest).user = {
      id: claims.sub,
      roles,
    };

    return next();
  } catch (error: any) {
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

export function requireRole(allowedRoles: string[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    const correlationId =
      (req.headers['x-correlation-id'] as string) || req.headers['correlation-id'] || '';
    const user = (req as AuthenticatedRequest).user;

    if (!user) {
      return res.status(401).json({
        success: false,
        error: {
          code: 'UNAUTHENTICATED',
          message: 'User is not authenticated',
          correlationId,
        },
      });
    }

    const hasRole = user.roles.some((role) => allowedRoles.includes(role));
    if (!hasRole) {
      return res.status(403).json({
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: 'User lacks required role',
          correlationId,
        },
      });
    }

    return next();
  };
}
