import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { createPublicKey } from 'node:crypto';
import { randomUUID } from 'node:crypto';

export interface AuthenticatedServiceRequest extends Request {
  // DIFF 3: Attach service identity instead of user identity to request
  service?: {
    id: string; // The calling service ID (e.g., 'commerce-service')
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
    console.error('Error fetching service verification key from auth-service:', error);
    throw new Error('Verification key retrieval failed');
  }
}

export async function requireServiceAuth(req: Request, res: Response, next: NextFunction) {
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

    // Verify token signature, alg, time bounds
    // DIFF 1: Restrict the allowed audience strictly to 'library-service'
    const claims = jwt.verify(token, publicKeyPem, {
      algorithms: ['RS256'],
      audience: 'library-service',
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

    // DIFF 2: Check scope permissions (require 'library.ownership.read')
    const scopes: string[] = claims.scopes || claims.scope?.split(' ') || [];
    if (!scopes.includes('library.ownership.read')) {
      return res.status(403).json({
        success: false,
        error: {
          code: 'FORBIDDEN',
          message: 'Insufficient scope permissions',
          correlationId,
        },
      });
    }

    // DIFF 3: Attach service identity instead of user identity to request
    (req as AuthenticatedServiceRequest).service = {
      id: claims.sub,
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
