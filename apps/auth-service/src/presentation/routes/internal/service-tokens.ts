import { Request, Response } from 'express';
import { randomUUID } from 'node:crypto';
import jwt from 'jsonwebtoken';
import { getKeyPair } from '../../../infrastructure/keys/key-manager.js';

interface ServiceClient {
  clientSecret: string;
  allowedAudiences: Record<string, string[]>; // targetAudience -> scopes
}

// Static registry of registered service clients
const SERVICE_CLIENTS: Record<string, ServiceClient> = {
  'commerce-service': {
    clientSecret: process.env.COMMERCE_SERVICE_SECRET || 'commerce-service-secret-phrase',
    allowedAudiences: {
      'catalog-service': ['catalog.quote.read', 'catalog.build.read'],
      'library-service': ['library.ownership.read'],
    },
  },
  'library-service': {
    clientSecret: process.env.LIBRARY_SERVICE_SECRET || 'library-service-secret-phrase',
    allowedAudiences: {
      'catalog-service': ['catalog.build.read'],
    },
  },
};

export async function serviceTokensHandler(req: Request, res: Response) {
  const correlationId = (req.headers['x-correlation-id'] as string) || randomUUID();

  // 1. Authenticate calling service using the X-Hathor-Service-Credential header
  const credentialHeader = req.headers['x-hathor-service-credential'] as string;
  if (!credentialHeader) {
    return res.status(401).json({
      success: false,
      error: {
        code: 'UNAUTHENTICATED',
        message: 'X-Hathor-Service-Credential header is missing',
        correlationId,
      },
    });
  }

  const parts = credentialHeader.split(':');
  if (parts.length !== 2) {
    return res.status(401).json({
      success: false,
      error: {
        code: 'UNAUTHENTICATED',
        message: 'Invalid credential header format. Expected clientId:clientSecret',
        correlationId,
      },
    });
  }

  const [clientId, clientSecret] = parts;
  const client = SERVICE_CLIENTS[clientId];

  if (!client || client.clientSecret !== clientSecret) {
    return res.status(401).json({
      success: false,
      error: {
        code: 'UNAUTHENTICATED',
        message: 'Invalid service client credential',
        correlationId,
      },
    });
  }

  // 2. Validate request body and audience enum values
  const { audience } = req.body;
  if (!audience || typeof audience !== 'string') {
    return res.status(422).json({
      success: false,
      error: {
        code: 'VALIDATION_FAILED',
        message: 'audience is required and must be a string',
        correlationId,
      },
    });
  }

  const allowedAudiences = ['catalog-service', 'library-service'];
  if (!allowedAudiences.includes(audience)) {
    return res.status(422).json({
      success: false,
      error: {
        code: 'VALIDATION_FAILED',
        message: 'Invalid audience requested. Allowed values: catalog-service, library-service',
        correlationId,
      },
    });
  }

  // 3. Authorization check: Check if caller is allowed to obtain a token for target audience
  const grantedScopes = client.allowedAudiences[audience];
  if (!grantedScopes) {
    return res.status(403).json({
      success: false,
      error: {
        code: 'FORBIDDEN',
        message: 'Caller is not allowed to obtain a token for this audience',
        correlationId,
      },
    });
  }

  try {
    // 4. Generate and sign the 5-minute internal service JWT using RS256
    const { privateKeyPem, kid } = getKeyPair();
    const now = Math.floor(Date.now() / 1000);

    const payload = {
      iss: 'hathor-auth-service',
      sub: clientId,
      aud: audience,
      scope: grantedScopes.join(' '),
      scopes: grantedScopes,
      iat: now,
      nbf: now,
      exp: now + 300, // 5 minutes expiration
      jti: randomUUID(),
      kid,
    };

    const accessToken = jwt.sign(payload, privateKeyPem, {
      algorithm: 'RS256',
      keyid: kid,
    });

    return res.status(200).json({
      accessToken,
      expiresIn: 300,
    });
  } catch (error) {
    console.error('Service token generation error:', error);
    return res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: 'An unexpected error occurred while generating the service token',
        correlationId,
      },
    });
  }
}
