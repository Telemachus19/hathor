import { describe, expect, it, vi, beforeEach } from 'vitest';
import request from 'supertest';
import { generateKeyPairSync, sign, randomUUID } from 'node:crypto';
import { createCommerceApp } from '../../../apps/commerce-service/src/app.js';

const { privateKey, publicKey } = generateKeyPairSync('rsa', {
  modulusLength: 2048,
  publicKeyEncoding: { type: 'spki', format: 'pem' },
  privateKeyEncoding: { type: 'pkcs8', format: 'pem' },
});

process.env.JWT_PUBLIC_KEY = publicKey;

function signJwt(payload: object, privateKeyPem: string): string {
  const header = { alg: 'RS256', typ: 'JWT' };
  const base64UrlHeader = Buffer.from(JSON.stringify(header)).toString('base64url');
  const base64UrlPayload = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const signatureInput = `${base64UrlHeader}.${base64UrlPayload}`;
  const signature = sign('sha256', Buffer.from(signatureInput), privateKeyPem).toString(
    'base64url'
  );
  return `${signatureInput}.${signature}`;
}

vi.mock('../../../apps/commerce-service/src/infrastructure/db/client.js', () => {
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
      for: vi.fn(() => chain),
      then: vi.fn((onFulfilled, onRejected) => {
        return Promise.resolve().then(getNextSelectMock).then(onFulfilled, onRejected);
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
    execute: vi.fn(() => Promise.resolve()),
  };

  (globalThis as any).mockTx = mockTx;

  return {
    commerceDb: {
      select: vi.fn(createMockSelectChain),
      insert: vi.fn(createMockInsertChain),
      execute: vi.fn(() => Promise.resolve()),
      transaction: vi.fn((callback) => callback(mockTx)),
    },
  };
});

describe('Commerce Transaction & Checkout API Endpoints', () => {
  let app: any;
  const userId = '00000000-0000-0000-0000-000000000001';
  const gameId = '00000000-0000-0000-0000-000000000002';
  let token: string;
  let idempotencyKey: string;

  beforeEach(() => {
    vi.clearAllMocks();
    (globalThis as any).selectMockQueue = [];
    app = createCommerceApp(async () => {});
    idempotencyKey = randomUUID();

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

    globalThis.fetch = vi.fn(async (url: any) => {
      const urlStr = String(url);
      if (urlStr.includes('/internal/v1/auth/service-tokens')) {
        return {
          ok: true,
          json: async () => ({ accessToken: 'mock-service-token', expiresIn: 300 }),
        } as any;
      }
      if (urlStr.includes('/internal/v1/catalog/quotes')) {
        const quoteItems = (globalThis as any).mockCatalogQuoteItems || [
          {
            gameId,
            title: 'Test Game',
            sellable: true,
            priceEgp: '299.99',
            currency: 'EGP',
            priceVersion: 'v1',
          },
        ];
        return {
          ok: true,
          json: async () => ({
            quoteId: randomUUID(),
            expiresAt: new Date(Date.now() + 900000).toISOString(),
            items: quoteItems,
          }),
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
    (globalThis as any).mockCatalogQuoteItems = null;
  });

  describe('1. Header and Body Validation', () => {
    it('rejects POST /txn/init missing Idempotency-Key header', async () => {
      const res = await request(app)
        .post('/txn/init')
        .set('Authorization', `Bearer ${token}`)
        .send({ paymentMethod: 'sim_fawry', cartVersion: 1 });

      expect(res.status).toBe(400);
      expect(res.body.error.code).toBe('VALIDATION_FAILED');
    });

    it('rejects invalid payment method', async () => {
      const res = await request(app)
        .post('/txn/init')
        .set('Authorization', `Bearer ${token}`)
        .set('Idempotency-Key', idempotencyKey)
        .send({ paymentMethod: 'invalid_method', cartVersion: 1 });

      expect(res.status).toBe(400);
      expect(res.body.error.code).toBe('VALIDATION_FAILED');
    });
  });

  describe('2. Idempotent Order Initialization (POST /txn/init)', () => {
    it('successfully initializes order and calculates server-authoritative EGP total', async () => {
      (globalThis as any).selectMockQueue = [
        [], // Query 1: Phase 1 idempotency record check (none)
        [{ userId, version: 1 }], // Query 2: Phase 1 cart select
        [{ gameId }], // Query 3: Phase 1 cart items select
        [], // Query 4: Phase 2 idempotency record re-check (none)
        [{ userId, version: 1 }], // Query 5: Phase 2 cart re-verify select
      ];

      const res = await request(app)
        .post('/txn/init')
        .set('Authorization', `Bearer ${token}`)
        .set('Idempotency-Key', idempotencyKey)
        .send({ paymentMethod: 'sim_fawry', cartVersion: 1 });

      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty('id');
      expect(res.body.status).toBe('payment_pending');
      expect(res.body.paymentMethod).toBe('sim_fawry');
      expect(res.body.totalAmountEgp).toBe('299.99');
      expect(res.body.currency).toBe('EGP');
      expect(res.body.paymentReference).toMatch(/^SIM-/);

      const mockTx = (globalThis as any).mockTx;
      expect(mockTx.insert).toHaveBeenCalledTimes(4); // order, orderItems, idempotencyRecords, audit
      expect(mockTx.delete).toHaveBeenCalled(); // cart items cleared
    });

    it('replays existing order on duplicate Idempotency-Key request', async () => {
      const existingOrderId = randomUUID();
      const existingOrder = {
        id: existingOrderId,
        userId,
        status: 'payment_pending',
        paymentMethod: 'sim_fawry',
        paymentReference: 'SIM-ABC12345',
        totalAmountEgp: '299.99',
        currency: 'EGP',
        expiresAt: new Date(Date.now() + 900000),
      };

      // Compute hash for same request body
      const crypto = await import('node:crypto');
      const hash = crypto
        .createHash('sha256')
        .update(JSON.stringify({ paymentMethod: 'sim_fawry', cartVersion: 1 }))
        .digest('hex');

      (globalThis as any).selectMockQueue = [
        [{ key: idempotencyKey, userId, requestHash: hash, orderId: existingOrderId }], // Query 1: idempotency check
        [existingOrder], // Query 2: order retrieval
      ];

      const res = await request(app)
        .post('/txn/init')
        .set('Authorization', `Bearer ${token}`)
        .set('Idempotency-Key', idempotencyKey)
        .send({ paymentMethod: 'sim_fawry', cartVersion: 1 });

      expect(res.status).toBe(200);
      expect(res.body.id).toBe(existingOrderId);
      expect(res.body.paymentReference).toBe('SIM-ABC12345');
    });

    it('rejects duplicate key with different payload with 409 CONFLICT', async () => {
      const existingOrderId = randomUUID();

      (globalThis as any).selectMockQueue = [
        [{ key: idempotencyKey, userId, requestHash: 'different_hash', orderId: existingOrderId }],
      ];

      const res = await request(app)
        .post('/txn/init')
        .set('Authorization', `Bearer ${token}`)
        .set('Idempotency-Key', idempotencyKey)
        .send({ paymentMethod: 'sim_vodafone_cash', cartVersion: 1 });

      expect(res.status).toBe(409);
      expect(res.body.error.code).toBe('CONFLICT');
    });

    it('handles atomic lock re-verification during concurrent requests with same Idempotency-Key', async () => {
      const existingOrderId = randomUUID();
      const existingOrder = {
        id: existingOrderId,
        userId,
        status: 'payment_pending',
        paymentMethod: 'sim_fawry',
        paymentReference: 'SIM-CONCUR123',
        totalAmountEgp: '299.99',
        currency: 'EGP',
        expiresAt: new Date(Date.now() + 900000),
      };

      const crypto = await import('node:crypto');
      const hash = crypto
        .createHash('sha256')
        .update(JSON.stringify({ paymentMethod: 'sim_fawry', cartVersion: 1 }))
        .digest('hex');

      // Simulate Request 2 where Phase 1 saw no record, but Phase 2 re-verification finds the committed record
      (globalThis as any).selectMockQueue = [
        [], // Phase 1 idempotency check: none
        [{ userId, version: 1 }], // Phase 1 cart select
        [{ gameId }], // Phase 1 cart items
        [{ key: idempotencyKey, userId, requestHash: hash, orderId: existingOrderId }], // Phase 2 re-verification: found!
        [existingOrder], // Phase 2 order retrieval for replay
      ];

      const res = await request(app)
        .post('/txn/init')
        .set('Authorization', `Bearer ${token}`)
        .set('Idempotency-Key', idempotencyKey)
        .send({ paymentMethod: 'sim_fawry', cartVersion: 1 });

      expect(res.status).toBe(200);
      expect(res.body.id).toBe(existingOrderId);
      expect(res.body.paymentReference).toBe('SIM-CONCUR123');
    });

    it('returns 409 CONFLICT during concurrent request re-verification if request parameters differ', async () => {
      const existingOrderId = randomUUID();

      // Simulate Request 2 where Phase 1 saw no record, but Phase 2 finds record committed with different requestHash
      (globalThis as any).selectMockQueue = [
        [], // Phase 1 idempotency check: none
        [{ userId, version: 1 }], // Phase 1 cart select
        [{ gameId }], // Phase 1 cart items
        [
          {
            key: idempotencyKey,
            userId,
            requestHash: 'different_hash_from_concurrent',
            orderId: existingOrderId,
          },
        ], // Phase 2 re-verification: different hash!
      ];

      const res = await request(app)
        .post('/txn/init')
        .set('Authorization', `Bearer ${token}`)
        .set('Idempotency-Key', idempotencyKey)
        .send({ paymentMethod: 'sim_fawry', cartVersion: 1 });

      expect(res.status).toBe(409);
      expect(res.body.error.code).toBe('CONFLICT');
    });
  });

  describe('3. Business Rules Enforcement', () => {
    it('rejects order initialization if cart version mismatches', async () => {
      (globalThis as any).selectMockQueue = [
        [], // Query 1: idempotency check
        [{ userId, version: 2 }], // Query 2: cart has version 2, but client sent 1
      ];

      const res = await request(app)
        .post('/txn/init')
        .set('Authorization', `Bearer ${token}`)
        .set('Idempotency-Key', idempotencyKey)
        .send({ paymentMethod: 'sim_fawry', cartVersion: 1 });

      expect(res.status).toBe(409);
      expect(res.body.error.code).toBe('CONFLICT');
    });

    it('rejects order initialization if cart is modified during inter-service RPC calls (Phase 2 re-verification failure)', async () => {
      (globalThis as any).selectMockQueue = [
        [], // Query 1: Phase 1 idempotency check
        [{ userId, version: 1 }], // Query 2: Phase 1 cart check ok
        [{ gameId }], // Query 3: Phase 1 cart items read
        [], // Query 4: Phase 2 idempotency record re-check (none)
        [{ userId, version: 2 }], // Query 5: Phase 2 re-check finds cart version updated to 2
      ];

      const res = await request(app)
        .post('/txn/init')
        .set('Authorization', `Bearer ${token}`)
        .set('Idempotency-Key', idempotencyKey)
        .send({ paymentMethod: 'sim_fawry', cartVersion: 1 });

      expect(res.status).toBe(409);
      expect(res.body.error.code).toBe('CONFLICT');
    });

    it('rejects order initialization if cart contains already owned game', async () => {
      (globalThis as any).mockOwnedGameIds = [gameId];

      (globalThis as any).selectMockQueue = [
        [], // Query 1: idempotency check
        [{ userId, version: 1 }], // Query 2: cart
        [{ gameId }], // Query 3: cart items
      ];

      const res = await request(app)
        .post('/txn/init')
        .set('Authorization', `Bearer ${token}`)
        .set('Idempotency-Key', idempotencyKey)
        .send({ paymentMethod: 'sim_fawry', cartVersion: 1 });

      expect(res.status).toBe(409);
      expect(res.body.error.code).toBe('CONFLICT');
    });

    it('rejects order initialization if catalog game is unsellable', async () => {
      (globalThis as any).mockCatalogQuoteItems = [
        {
          gameId,
          title: 'Unpublished Game',
          sellable: false,
          priceEgp: '299.99',
          currency: 'EGP',
          priceVersion: 'v1',
        },
      ];

      (globalThis as any).selectMockQueue = [
        [], // Query 1: idempotency check
        [{ userId, version: 1 }], // Query 2: cart
        [{ gameId }], // Query 3: cart items
      ];

      const res = await request(app)
        .post('/txn/init')
        .set('Authorization', `Bearer ${token}`)
        .set('Idempotency-Key', idempotencyKey)
        .send({ paymentMethod: 'sim_fawry', cartVersion: 1 });

      expect(res.status).toBe(409);
      expect(res.body.error.code).toBe('CONFLICT');
    });
  });

  describe('4. GET /txn/:orderId', () => {
    it('returns single order details for caller', async () => {
      const orderId = randomUUID();
      const mockOrder = {
        id: orderId,
        userId,
        status: 'payment_pending',
        paymentMethod: 'sim_fawry',
        paymentReference: 'SIM-XYZ98765',
        totalAmountEgp: '299.99',
        currency: 'EGP',
        expiresAt: new Date(Date.now() + 900000),
      };

      (globalThis as any).selectMockQueue = [[mockOrder]];

      const res = await request(app).get(`/txn/${orderId}`).set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.id).toBe(orderId);
      expect(res.body.paymentReference).toBe('SIM-XYZ98765');
    });

    it('returns 404 for non-existent or unowned order', async () => {
      (globalThis as any).selectMockQueue = [[]];

      const res = await request(app)
        .get(`/txn/${randomUUID()}`)
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(404);
      expect(res.body.error.code).toBe('NOT_FOUND');
    });
  });
});
