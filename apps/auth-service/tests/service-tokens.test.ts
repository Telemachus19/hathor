import { describe, expect, it, vi, beforeEach } from 'vitest';
import request from 'supertest';
import { createAuthApp } from '../src/app.js';
import { verifyAccessToken } from '../src/domain/token.js';

describe('POST /internal/v1/auth/service-tokens', () => {
  let app: any;
  const COMMERCE_CREDENTIAL = 'commerce-service:commerce-service-secret-phrase';
  const LIBRARY_CREDENTIAL = 'library-service:library-service-secret-phrase';

  beforeEach(() => {
    app = createAuthApp(async () => {});
  });

  it('successfully issues a service token for an authorized client and audience', async () => {
    const response = await request(app)
      .post('/internal/v1/auth/service-tokens')
      .set('X-Hathor-Service-Credential', COMMERCE_CREDENTIAL)
      .send({
        audience: 'catalog-service',
      });

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('accessToken');
    expect(response.body.expiresIn).toBe(300);

    // Verify token claims by parsing the signed token using public key
    const claims = verifyAccessToken(response.body.accessToken);
    expect(claims.iss).toBe('hathor-auth-service');
    expect(claims.sub).toBe('commerce-service');
    expect(claims.aud).toBe('catalog-service');
    
    // Check scopes format in JWT
    const typedClaims = claims as any;
    expect(typedClaims.scopes).toEqual(['catalog.quote.read', 'catalog.build.read']);
    expect(typedClaims.scope).toBe('catalog.quote.read catalog.build.read');
    expect(typedClaims.exp - typedClaims.iat).toBe(300);
  });

  it('rejects request if X-Hathor-Service-Credential header is missing', async () => {
    const response = await request(app)
      .post('/internal/v1/auth/service-tokens')
      .send({
        audience: 'catalog-service',
      });

    expect(response.status).toBe(401);
    expect(response.body.error.code).toBe('UNAUTHENTICATED');
    expect(response.body.error.message).toContain('header is missing');
  });

  it('rejects request if credential header format is invalid', async () => {
    const response = await request(app)
      .post('/internal/v1/auth/service-tokens')
      .set('X-Hathor-Service-Credential', 'invalid-format-without-colon')
      .send({
        audience: 'catalog-service',
      });

    expect(response.status).toBe(401);
    expect(response.body.error.code).toBe('UNAUTHENTICATED');
    expect(response.body.error.message).toContain('Expected clientId:clientSecret');
  });

  it('rejects request for unknown clientId or incorrect secret', async () => {
    const response = await request(app)
      .post('/internal/v1/auth/service-tokens')
      .set('X-Hathor-Service-Credential', 'commerce-service:wrong-secret')
      .send({
        audience: 'catalog-service',
      });

    expect(response.status).toBe(401);
    expect(response.body.error.code).toBe('UNAUTHENTICATED');
    expect(response.body.error.message).toContain('Invalid service client credential');
  });

  it('rejects with 422 if audience is missing from request body', async () => {
    const response = await request(app)
      .post('/internal/v1/auth/service-tokens')
      .set('X-Hathor-Service-Credential', COMMERCE_CREDENTIAL)
      .send({});

    expect(response.status).toBe(422);
    expect(response.body.error.code).toBe('VALIDATION_FAILED');
  });

  it('rejects with 422 if audience requested is not in allowed target service enums', async () => {
    const response = await request(app)
      .post('/internal/v1/auth/service-tokens')
      .set('X-Hathor-Service-Credential', COMMERCE_CREDENTIAL)
      .send({
        audience: 'nonexistent-service',
      });

    expect(response.status).toBe(422);
    expect(response.body.error.code).toBe('VALIDATION_FAILED');
  });

  it('rejects with 403 if client is unauthorized to obtain a token for requested audience', async () => {
    // library-service is NOT allowed to request library-service audience
    const response = await request(app)
      .post('/internal/v1/auth/service-tokens')
      .set('X-Hathor-Service-Credential', LIBRARY_CREDENTIAL)
      .send({
        audience: 'library-service',
      });

    expect(response.status).toBe(403);
    expect(response.body.error.code).toBe('FORBIDDEN');
    expect(response.body.error.message).toContain('not allowed to obtain a token for this audience');
  });
});
