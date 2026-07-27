import { describe, expect, it } from 'vitest';
import { generateAccessToken, verifyAccessToken } from '../src/domain/token.js';
import { getKeyPair } from '../src/infrastructure/keys/key-manager.js';
import jwt from 'jsonwebtoken';
import { generateKeyPairSync } from 'node:crypto';

describe('token', () => {
  it('should sign and verify a valid RS256 token with all required claims', () => {
    const user = {
      id: 'user-uuid-123',
      roles: ['gamer'],
      authorizationVersion: 2,
    };

    const token = generateAccessToken(user);
    expect(token).toBeDefined();

    // Decode token header to check kid and alg
    const decoded = jwt.decode(token, { complete: true });
    expect(decoded?.header.alg).toBe('RS256');
    expect(decoded?.header.kid).toBe(getKeyPair().kid);

    // Verify token using our helper
    const verified = verifyAccessToken(token);
    expect(verified.iss).toBe('hathor-auth-service');
    expect(verified.aud).toBe('hathor-services');
    expect(verified.sub).toBe(user.id);
    expect(verified.roles).toEqual(user.roles);
    expect(verified.authorizationVersion).toBe(user.authorizationVersion);
    expect(verified.jti).toBeDefined();
    expect(verified.exp - verified.iat).toBe(15 * 60); // 15 minutes
  });

  it('should fail verification if token is signed with a different key', () => {
    const user = {
      id: 'user-uuid-123',
      roles: ['gamer'],
      authorizationVersion: 2,
    };

    // Generate a wrong key pair
    const { privateKey } = generateKeyPairSync('rsa', {
      modulusLength: 2048,
      publicKeyEncoding: { type: 'spki', format: 'pem' },
      privateKeyEncoding: { type: 'pkcs8', format: 'pem' },
    });

    const wrongToken = jwt.sign(
      {
        iss: 'hathor-auth-service',
        aud: 'hathor-services',
        sub: user.id,
        roles: user.roles,
        authorizationVersion: user.authorizationVersion,
      },
      privateKey,
      {
        algorithm: 'RS256',
      }
    );

    expect(() => verifyAccessToken(wrongToken)).toThrow();
  });
});
