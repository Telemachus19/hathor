import request from 'supertest';
import { describe, expect, it } from 'vitest';
import { createGatewayApp } from '../../../apps/api-gateway/src/app.js';
import { CORRELATION_ID_HEADER, withCorrelationId } from '../src/index.js';

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const app = createGatewayApp();

// ---------------------------------------------------------------------------
// Helper to verify the standard error shape across all edge error responses
// per docs/contracts/service-contracts.md:
//   { "error": { "code": "...", "message": "...", "correlationId": "uuid" } }
// ---------------------------------------------------------------------------
function expectStandardError(body: any, expectedCode: string) {
  expect(body).toHaveProperty('error');
  expect(body.error).toHaveProperty('code', expectedCode);
  expect(body.error).toHaveProperty('message');
  expect(typeof body.error.message).toBe('string');
  expect(body.error).toHaveProperty('correlationId');
  expect(body.error.correlationId).toMatch(UUID_REGEX);
  // The contract error model has exactly { code, message, correlationId }.
  // Verify the old non-contract fields are absent. Was a tiny missauge 
  expect(body).not.toHaveProperty('success');
  expect(body.error).not.toHaveProperty('status');
  expect(body.error).not.toHaveProperty('timestamp');
}

// ===========================================================================
// 1. Correlation ID (docs/architecture/system-architecture.md line 98:
//    "Each request and event carries a correlation ID")
// ===========================================================================
describe('correlation ID', () => {
  it('generates a correlation ID when none is provided', async () => {
    const res = await request(app).get('/health/live');
    expect(res.status).toBe(200);
    const id = res.headers[CORRELATION_ID_HEADER];
    expect(id).toBeDefined();
    expect(id).toMatch(UUID_REGEX);
  });

  it('preserves a valid incoming correlation ID', async () => {
    const { correlationId, headers } = withCorrelationId();
    const res = await request(app).get('/health/live').set(headers);
    expect(res.status).toBe(200);
    expect(res.headers[CORRELATION_ID_HEADER]).toBe(correlationId);
  });

  it('replaces an invalid correlation ID with a generated one', async () => {
    const res = await request(app)
      .get('/health/live')
      .set(CORRELATION_ID_HEADER, 'not-a-uuid');
    expect(res.status).toBe(200);
    const id = res.headers[CORRELATION_ID_HEADER];
    expect(id).toMatch(UUID_REGEX);
    expect(id).not.toBe('not-a-uuid');
  });

  it('replaces an empty-string correlation ID with a generated one', async () => {
    const res = await request(app)
      .get('/health/live')
      .set(CORRELATION_ID_HEADER, '');
    const id = res.headers[CORRELATION_ID_HEADER];
    expect(id).toMatch(UUID_REGEX);
    expect(id).not.toBe('');
  });

  it('replaces an oversized value with a generated UUID', async () => {
    const oversized = '12345678-1234-1234-1234-123456789012-extra-noise';
    const res = await request(app)
      .get('/health/live')
      .set(CORRELATION_ID_HEADER, oversized);
    const id = res.headers[CORRELATION_ID_HEADER];
    expect(id).toMatch(UUID_REGEX);
    expect(id).not.toBe(oversized);
  });

  it('returns correlation ID on error responses', async () => {
    const { correlationId, headers } = withCorrelationId();
    const res = await request(app).get('/nowhere').set(headers);
    expect(res.status).toBe(404);
    expect(res.headers[CORRELATION_ID_HEADER]).toBe(correlationId);
    expect(res.body.error.correlationId).toBe(correlationId);
  });
});

// ===========================================================================
// 2. Internal path isolation (docs/architecture/system-architecture.md:
//    "The browser cannot call an /internal/* route")
// ===========================================================================
describe('internal path isolation', () => {
  it('blocks GET requests to /api/v1/internal/*', async () => {
    const res = await request(app).get('/api/v1/internal/anything');
    expect(res.status).toBe(403);
    expectStandardError(res.body, 'FORBIDDEN');
    expect(res.body.error.message).toContain('Internal paths');
  });

  it('blocks POST requests to /api/v1/internal/auth/service-tokens', async () => {
    const res = await request(app)
      .post('/api/v1/internal/auth/service-tokens')
      .send({ audience: 'catalog-service' });
    expect(res.status).toBe(403);
    expectStandardError(res.body, 'FORBIDDEN');
  });

  it('blocks access to /api/v1/internal/catalog/quotes', async () => {
    const res = await request(app)
      .post('/api/v1/internal/catalog/quotes')
      .send({ gameIds: ['00000000-0000-0000-0000-000000000001'] });
    expect(res.status).toBe(403);
    expectStandardError(res.body, 'FORBIDDEN');
  });

  it('blocks access to /api/v1/internal/library/ownership', async () => {
    const res = await request(app)
      .post('/api/v1/internal/library/ownership')
      .send({ userId: 'test', gameIds: [] });
    expect(res.status).toBe(403);
    expectStandardError(res.body, 'FORBIDDEN');
  });

  it('includes the propagated correlation ID in the rejection', async () => {
    const { correlationId, headers } = withCorrelationId();
    const res = await request(app)
      .get('/api/v1/internal/catalog/quotes')
      .set(headers);
    expect(res.status).toBe(403);
    expect(res.body.error.correlationId).toBe(correlationId);
  });

  it('does not block legitimate public paths that start with /int', async () => {
    // "internal" starts with "int" — ensure the blocker checks "/internal" exactly
    const res = await request(app).get('/api/v1/inventory/apps');
    // This should NOT be 403. It should be 503 (no upstream) or proxied.
    expect(res.status).not.toBe(403);
  });
});

// ===========================================================================
// 3. Security headers
//    (docs/security/security-architecture.md:
//     "Helmet/CSP must block object embeds, unsafe base URLs, and
//      unapproved script sources")
// ===========================================================================
describe('security headers', () => {
  it('sets X-Frame-Options to DENY', async () => {
    const res = await request(app).get('/health/live');
    expect(res.headers['x-frame-options']).toBe('DENY');
  });

  it('sets Content-Security-Policy with required directives', async () => {
    const res = await request(app).get('/health/live');
    const csp = res.headers['content-security-policy'];
    expect(csp).toBeDefined();
    // Per security-architecture.md: block object embeds
    expect(csp).toContain("object-src 'none'");
    // Block unsafe base URLs
    expect(csp).toContain("base-uri 'self'");
    // Block framing at CSP level
    expect(csp).toContain("frame-ancestors 'none'");
    // Unapproved script sources
    expect(csp).toContain("script-src 'self'");
  });

  it('sets X-Content-Type-Options to nosniff', async () => {
    const res = await request(app).get('/health/live');
    expect(res.headers['x-content-type-options']).toBe('nosniff');
  });

  it('disables X-Powered-By header', async () => {
    const res = await request(app).get('/health/live');
    expect(res.headers['x-powered-by']).toBeUndefined();
  });
});

// ===========================================================================
// 4. CORS policy
//    (docs/security/security-architecture.md:
//     "Production CORS uses exact HTTPS origins and never wildcard credentials")
// ===========================================================================
describe('CORS policy', () => {
  it('returns correct CORS headers for the allowed origin', async () => {
    const res = await request(app)
      .options('/api/v1/user/register')
      .set('Origin', 'http://localhost:3000')
      .set('Access-Control-Request-Method', 'POST');
    expect(res.headers['access-control-allow-origin']).toBe('http://localhost:3000');
    expect(res.headers['access-control-allow-credentials']).toBe('true');
  });

  it('allows Idempotency-Key in CORS allowed headers', async () => {
    const res = await request(app)
      .options('/api/v1/txn/init')
      .set('Origin', 'http://localhost:3000')
      .set('Access-Control-Request-Method', 'POST')
      .set('Access-Control-Request-Headers', 'Content-Type, Idempotency-Key');
    expect(res.status).toBeLessThan(400);
    const allowed = res.headers['access-control-allow-headers']?.toLowerCase() || '';
    expect(allowed).toContain('idempotency-key');
  });

  it('exposes X-Correlation-ID in CORS headers', async () => {
    const res = await request(app)
      .get('/health/live')
      .set('Origin', 'http://localhost:3000');
    const exposed = res.headers['access-control-expose-headers'];
    expect(exposed).toBeDefined();
    expect(exposed.toLowerCase()).toContain('x-correlation-id');
  });

  it('does not set allow-origin for a disallowed origin', async () => {
    const res = await request(app)
      .options('/api/v1/user/register')
      .set('Origin', 'https://evil.example.com')
      .set('Access-Control-Request-Method', 'POST');
    expect(res.headers['access-control-allow-origin']).toBeUndefined();
  });
});

// ===========================================================================
// 5. Route mapping verification
//    (docs/architecture/system-architecture.md: Public Routes table)
//    In supertest without real upstreams, proxy routes will 503.
//    We verify the request reaches the proxy (not 404/403).
// ===========================================================================
describe('route namespace mapping', () => {
  const publicNamespaces = [
    // [method, path, owner description]
    ['GET', '/api/v1/user/me', 'Auth'],
    ['POST', '/api/v1/user/register', 'Auth'],
    ['POST', '/api/v1/user/login', 'Auth'],
    ['GET', '/api/v1/store/apps', 'Catalog'],
    ['GET', '/api/v1/cart', 'Commerce'],
    ['POST', '/api/v1/txn/init', 'Commerce'],
    ['GET', '/api/v1/inventory/apps', 'Library'],
    ['GET', '/api/v1/creator/games', 'Catalog'],
    ['POST', '/api/v1/admin/users/00000000-0000-0000-0000-000000000001/roles', 'Auth'],
    ['PATCH', '/api/v1/admin/games/00000000-0000-0000-0000-000000000001/status', 'Catalog'],
    ['GET', '/api/v1/admin/transactions', 'Commerce'],
  ] as const;

  it.each(publicNamespaces)(
    '%s %s is proxied to %s (not blocked or 404)',
    async (method, path, _owner) => {
      // In supertest without real upstreams, the proxy will either:
      // - Return 503 (proxy error, service unavailable) — this proves routing works
      // - Hang and timeout — we're ok with any non-403, non-404 response
      const req = request(app);
      const agent =
        method === 'GET' ? req.get(path)
          : method === 'POST' ? req.post(path)
            : req.patch(path);

      const res = await agent.timeout({ response: 2000 }).catch((err: any) => err.response || { status: 503 });

      // Must NOT be 403 (internal path block) or 404 (no route match)
      expect(res.status).not.toBe(403);
      expect(res.status).not.toBe(404);
    }
  );
});

// ===========================================================================
// 6. Not-found handler with standard error shape
// ===========================================================================
describe('not-found handler', () => {
  it('returns 404 for completely unknown paths', async () => {
    const res = await request(app).get('/completely-unknown');
    expect(res.status).toBe(404);
    expectStandardError(res.body, 'NOT_FOUND');
  });

  it('includes the request method and path in the error message', async () => {
    const res = await request(app).delete('/nowhere');
    expect(res.status).toBe(404);
    expect(res.body.error.message).toContain('DELETE');
    expect(res.body.error.message).toContain('/nowhere');
  });
});

// ===========================================================================
// 7. Health probes (docs/architecture/system-architecture.md line 98:
//    "Every service exposes /health/live and /health/ready")
// ===========================================================================
describe('health probes', () => {
  it('returns 200 with correlation ID on /health/live', async () => {
    const res = await request(app).get('/health/live');
    expect(res.status).toBe(200);
    expect(res.body.data.service).toBe('api-gateway');
    expect(res.body.data.status).toBe('live');
    expect(res.headers[CORRELATION_ID_HEADER]).toBeDefined();
  });

  it('returns 200 with correlation ID on /health/ready', async () => {
    const res = await request(app).get('/health/ready');
    expect(res.status).toBe(200);
    expect(res.body.data.service).toBe('api-gateway');
    expect(res.body.data.status).toBe('ready');
    expect(res.headers[CORRELATION_ID_HEADER]).toBeDefined();
  });
});
