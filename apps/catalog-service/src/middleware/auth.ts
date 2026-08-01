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

export function requireRole(requiredRole: string) {
  return (req: Request, res: Response, next: NextFunction) => {
    const correlationId =
      (req.headers['x-correlation-id'] as string) || req.headers['correlation-id'] || '';

    const authReq = req as AuthenticatedRequest;
    if (!authReq.user || !authReq.user.roles.includes(requiredRole)) {
      return res.status(403).json({
        success: false,
        error: {
          code: 'FORBIDDEN',
          message: `User lacks required role: ${requiredRole}`,
          correlationId,
        },
      });
    }

    return next();
  };
}

export interface AuthenticatedServiceRequest extends Request {
  service?: {
    id: string;
  };
}

export function requireServiceAuth(requiredScope: string = 'catalog.quote.read') {
  return async (req: Request, res: Response, next: NextFunction) => {
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
        audience: 'catalog-service',
        issuer: 'hathor-auth-service',
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

      const scopes: string[] = claims.scopes || claims.scope?.split(' ') || [];
      if (!scopes.includes(requiredScope)) {
        return res.status(403).json({
          success: false,
          error: {
            code: 'FORBIDDEN',
            message: `Service token lacks required scope: ${requiredScope}`,
            correlationId,
          },
        });
      }

      (req as AuthenticatedServiceRequest).service = {
        id: claims.sub,
      };

      return next();
    } catch (error: any) {
      if (error?.name === 'JsonWebTokenError' && error?.message?.includes('audience')) {
        return res.status(403).json({
          success: false,
          error: {
            code: 'FORBIDDEN',
            message: 'Invalid audience in service token',
            correlationId,
          },
        });
      }
      return res.status(401).json({
        success: false,
        error: {
          code: 'UNAUTHENTICATED',
          message: 'Invalid or expired token',
          correlationId,
        },
      });
    }
  };
}
