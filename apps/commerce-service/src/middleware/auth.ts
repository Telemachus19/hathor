import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { createPublicKey } from 'node:crypto';

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
  };
}

// In-memory cache for the public key (PEM format)
let cachedPublicKeyPem: string | null = null;

async function getPublicKey(): Promise<string> {
  // 1. Check if we already have it in the cache
  if (cachedPublicKeyPem) {
    return cachedPublicKeyPem;
  }

  // 2. Check if it's set in the environment variables
  if (process.env.JWT_PUBLIC_KEY) {
    cachedPublicKeyPem = process.env.JWT_PUBLIC_KEY.replace(/\\n/g, '\n');
    return cachedPublicKeyPem;
  }

  // 3. Otherwise, fetch it dynamically from the auth-service JWKS endpoint
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

    // Convert JWK to PEM format using native crypto
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

    // Verify token signature, alg, time bounds
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

    // Attach user identity to request
    (req as AuthenticatedRequest).user = {
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
