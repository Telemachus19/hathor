import { describe, expect, it, vi, beforeEach } from 'vitest';
import request from 'supertest';
import { generateKeyPairSync, sign } from 'node:crypto';
import { createCommerceApp } from '../../../apps/commerce-service/src/app.js';

// Generate a real RS256 key pair for the test suite
const { privateKey, publicKey } = generateKeyPairSync('rsa', {
  modulusLength: 2048,
  publicKeyEncoding: { type: 'spki', format: 'pem' },
  privateKeyEncoding: { type: 'pkcs8', format: 'pem' },
});

process.env.JWT_PUBLIC_KEY = publicKey;

// Helper function to sign RS256 JWT using native crypto module
function signJwt(payload: object, privateKeyPem: string): string {
  const header = { alg: 'RS256', typ: 'JWT' };
  const base64UrlHeader = Buffer.from(JSON.stringify(header)).toString('base64url');
  const base64UrlPayload = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const signatureInput = `${base64UrlHeader}.${base64UrlPayload}`;
  const signature = sign('sha256', Buffer.from(signatureInput), privateKeyPem).toString('base64url');
  return `${signatureInput}.${signature}`;
}

vi.mock('../../../apps/commerce-service/src/infrastructure/db/client.js', () => {
  // A queued response mock system to support multiple sequential queries cleanly
  const getNextSelectMock = () => {
    const queue = (globalThis as any).selectMockQueue;
    const next = queue.shift();
    return next !== undefined ? next : [];
  };

  const createMockSelectChain = () => {
    const chain: any = {
      from: vi.fn(() => chain),
      where: vi.fn(() => chain),
      limit: vi.fn(() => chain),
      // A custom then method makes this object a Promise/thenable.
      // It executes getNextSelectMock only once when the query chain is awaited.
      then: vi.fn((onFulfilled, onRejected) => {
        return Promise.resolve()
          .then(getNextSelectMock)
          .then(onFulfilled, onRejected);
      }),
    };
    return chain;
  };

  const createMockInsertChain = () => {
    const chain: any = {};
    chain.values = vi.fn(() => chain);
    chain.onConflictDoNothing = vi.fn(() => chain);
    chain.returning = vi.fn(() => Promise.resolve([]));
    return chain;
  };

  const createMockUpdateChain = () => {
    const chain: any = {};
    chain.set = vi.fn(() => chain);
    chain.where = vi.fn(() => Promise.resolve());
    return chain;
  };

  const createMockDeleteChain = () => {
    const chain: any = {};
    chain.where = vi.fn(() => Promise.resolve());
    return chain;
  };

  const mockTx = {
    select: vi.fn(createMockSelectChain),
    insert: vi.fn(createMockInsertChain),
    update: vi.fn(createMockUpdateChain),
    delete: vi.fn(createMockDeleteChain),
  };

  (globalThis as any).mockTx = mockTx;

  return {
    commerceDb: {
      select: vi.fn(createMockSelectChain),
      insert: vi.fn(createMockInsertChain),
      transaction: vi.fn((callback) => callback(mockTx)),
    },
  };
});

import { commerceDb } from '../../../apps/commerce-service/src/infrastructure/db/client.js';

describe('Commerce Cart API Endpoints', () => {
  let app: any;
  const userId = '00000000-0000-0000-0000-000000000001';
  const gameId = '00000000-0000-0000-0000-000000000002';
  let token: string;

  beforeEach(() => {
    vi.clearAllMocks();
    (globalThis as any).selectMockQueue = [];
    app = createCommerceApp(async () => {});
    
    // Generate valid JWT token signed with our private key
    token = signJwt(
      {
        sub: userId,
        iss: 'hathor-auth-service',
        aud: 'hathor-services',
        roles: ['gamer'],
        exp: Math.floor(Date.now() / 1000) + 900,
      },
      privateKey
    );

    // Mock global fetch for service-to-service calls
    globalThis.fetch = vi.fn(async (url: any, options: any) => {
      const urlStr = String(url);
      if (urlStr.includes('/internal/v1/auth/service-tokens')) {
        return {
          ok: true,
          json: async () => ({ accessToken: 'mock-service-token', expiresIn: 300 }),
        } as any;
      }
      if (urlStr.includes('/internal/v1/library/ownership-check')) {
        const owned = (globalThis as any).mockOwnedGameIds || [];
        return {
          ok: true,
          json: async () => ({ ownedGameIds: owned }),
        } as any;
      }
      return {
        ok: false,
        status: 404,
        statusText: 'Not Found',
      } as any;
    });

    (globalThis as any).mockOwnedGameIds = [];
  });

  describe('1. Authentication and Identity Enforcement', () => {
    it('rejects unauthenticated requests', async () => {
      const res = await request(app).get('/cart');
      expect(res.status).toBe(401);
      expect(res.body.error.code).toBe('UNAUTHENTICATED');
    });

    it('rejects requests with invalid token signature', async () => {
      const wrongToken = token + 'invalid';
      const res = await request(app)
        .get('/cart')
        .set('Authorization', `Bearer ${wrongToken}`);
      expect(res.status).toBe(401);
      expect(res.body.error.code).toBe('UNAUTHENTICATED');
    });
  });

  describe('2. GET /cart', () => {
    it('returns active cart and dynamically creates one if not found', async () => {
      // Setup mock queue for selects
      (globalThis as any).selectMockQueue = [
        [], // Query 1: cart check in GET route (not found)
        [{ userId, version: 1 }], // Query 2: cart retrieval in getCartResponse
        [{ gameId }], // Query 3: items retrieval in getCartResponse
      ];

      const res = await request(app)
        .get('/cart')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body).toEqual({
        version: 1,
        items: [{ gameId, already_owned: false }],
      });

      // Verify cart insertion occurred since it was not found
      expect(commerceDb.insert).toHaveBeenCalled();
    });
  });

  describe('3. POST /cart/:gameId', () => {
    it('adds item to cart, increments version atomically, and rejects duplicates', async () => {
      // Case 1: Mock duplicate check: returns existing item
      (globalThis as any).selectMockQueue = [
        [{ userId, gameId }], // Query 1: duplicate check (item exists)
      ];

      const conflictRes = await request(app)
        .post(`/cart/${gameId}`)
        .set('Authorization', `Bearer ${token}`);

      expect(conflictRes.status).toBe(409);
      expect(conflictRes.body.error.code).toBe('CONFLICT');

      // Case 2: Mock successful insert
      vi.clearAllMocks();
      (globalThis as any).selectMockQueue = [
        [], // Query 1: duplicate check (no items)
        [{ userId, version: 1 }], // Query 2: transaction select cart (exists)
        [{ userId, version: 2 }], // Query 3: response cart retrieval
        [{ gameId }], // Query 4: response items retrieval
      ];

      const res = await request(app)
        .post(`/cart/${gameId}`)
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body).toEqual({
        version: 2,
        items: [{ gameId, already_owned: false }],
      });

      // Verify transaction was used and version increment occurred
      expect(commerceDb.transaction).toHaveBeenCalled();
      const mockTx = (globalThis as any).mockTx;
      expect(mockTx.update).toHaveBeenCalled();
      expect(mockTx.insert).toHaveBeenCalled();
    });
  });

  describe('4. DELETE /cart/:gameId', () => {
    it('removes item from cart and increments version if item existed', async () => {
      // 1. Mock item does not exist: version should not increment
      (globalThis as any).selectMockQueue = [
        [], // Query 1: exist check (not found)
        [{ userId, version: 1 }], // Query 2: response cart retrieval
        [], // Query 3: response items retrieval (empty)
      ];

      const resNoOp = await request(app)
        .delete(`/cart/${gameId}`)
        .set('Authorization', `Bearer ${token}`);

      expect(resNoOp.status).toBe(200);
      expect(commerceDb.transaction).not.toHaveBeenCalled();

      // 2. Mock item exists: version increments
      vi.clearAllMocks();
      (globalThis as any).selectMockQueue = [
        [{ userId, gameId }], // Query 1: exist check (found)
        [{ userId, version: 2 }], // Query 2: response cart retrieval
        [], // Query 3: response items retrieval
      ];

      const res = await request(app)
        .delete(`/cart/${gameId}`)
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(commerceDb.transaction).toHaveBeenCalled();
      const mockTx = (globalThis as any).mockTx;
      expect(mockTx.delete).toHaveBeenCalled();
      expect(mockTx.update).toHaveBeenCalled();
    });
  });

  describe('5. Inter-service Ownership Integration & Fail-Closed Behavior', () => {
    it('marks matching cart items as already_owned: true', async () => {
      // Configure mock library ownership to return that gameId is owned
      (globalThis as any).mockOwnedGameIds = [gameId];

      (globalThis as any).selectMockQueue = [
        [], // Query 1: cart check in GET route (not found)
        [{ userId, version: 1 }], // Query 2: cart retrieval in getCartResponse
        [{ gameId }], // Query 3: items retrieval in getCartResponse
      ];

      const res = await request(app)
        .get('/cart')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body).toEqual({
        version: 1,
        items: [{ gameId, already_owned: true }],
      });
    });

    it('fails closed and returns 503 if library ownership check fails', async () => {
      // Simulate library service returning failure status
      globalThis.fetch = vi.fn(async (url: any) => {
        const urlStr = String(url);
        if (urlStr.includes('/internal/v1/auth/service-tokens')) {
          return {
            ok: true,
            json: async () => ({ accessToken: 'mock-service-token', expiresIn: 300 }),
          } as any;
        }
        return {
          ok: false,
          status: 500,
          statusText: 'Internal Server Error',
        } as any;
      });

      (globalThis as any).selectMockQueue = [
        [], // Query 1: cart check in GET route (not found)
        [{ userId, version: 1 }], // Query 2: cart in response
        [{ gameId }], // Query 3: items in response
      ];

      const res = await request(app)
        .get('/cart')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(503);
      expect(res.body.error.code).toBe('DEPENDENCY_UNAVAILABLE');
    });
  });
});
