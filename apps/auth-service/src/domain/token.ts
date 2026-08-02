import jwt from 'jsonwebtoken';
import { randomUUID } from 'node:crypto';
import { getKeyPair } from '../infrastructure/keys/key-manager.js';

export interface AccessTokenClaims {
  iss: string;
  aud: string;
  sub: string;
  roles: string[];
  iat: number;
  nbf: number;
  exp: number;
  jti: string;
  kid: string;
  authorizationVersion: number;
}

/**
 * Generates a short-lived (15 minute) RS256 access JWT for a user.
 */
export function generateAccessToken(user: {
  id: string;
  roles: string[];
  authorizationVersion: number;
}): string {
  const { privateKeyPem, kid } = getKeyPair();
  const now = Math.floor(Date.now() / 1000);

  const payload: AccessTokenClaims = {
    iss: 'hathor-auth-service',
    aud: 'hathor-services',
    sub: user.id,
    roles: user.roles,
    iat: now,
    nbf: now,
    exp: now + 15 * 60, // 15 minutes expiry
    jti: randomUUID(),
    kid,
    authorizationVersion: user.authorizationVersion,
  };

  return jwt.sign(payload, privateKeyPem, {
    algorithm: 'RS256',
    keyid: kid,
  });
}

/**
 * Verifies a token using the public key and returns its typed claims.
 */
export function verifyAccessToken(token: string): AccessTokenClaims {
  const { publicKeyPem } = getKeyPair();
  return jwt.verify(token, publicKeyPem, {
    algorithms: ['RS256'],
    issuer: 'hathor-auth-service',
    audience: 'hathor-services',
  }) as AccessTokenClaims;
}
