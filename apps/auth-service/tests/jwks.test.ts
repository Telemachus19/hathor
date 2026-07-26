import { describe, expect, it } from 'vitest';
import request from 'supertest';
import { createAuthApp } from '../src/app.js';
import { getKeyPair } from '../src/infrastructure/keys/key-manager.js';

describe('GET /user/.well-known/jwks.json', () => {
  it('should expose the public key in JWKS format', async () => {
    const app = createAuthApp(async () => {});
    const keyPair = getKeyPair();

    const response = await request(app).get('/user/.well-known/jwks.json');

    expect(response.status).toBe(200);
    expect(response.body).toBeDefined();
    expect(response.body.keys).toBeInstanceOf(Array);
    expect(response.body.keys.length).toBe(1);

    const jwk = response.body.keys[0];
    expect(jwk.kty).toBe('RSA');
    expect(jwk.use).toBe('sig');
    expect(jwk.alg).toBe('RS256');
    expect(jwk.kid).toBe(keyPair.kid);
    expect(jwk.n).toBeDefined();
    expect(jwk.e).toBeDefined();
  });
});
