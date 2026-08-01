import { describe, expect, it, vi, beforeEach } from 'vitest';
import request from 'supertest';
import { generateKeyPairSync, sign } from 'node:crypto';
import { createCatalogApp } from '../../../apps/catalog-service/src/app.js';

// Generate a real RS256 key pair for the test suite
const { privateKey, publicKey } = generateKeyPairSync('rsa', {
  modulusLength: 2048,
  publicKeyEncoding: { type: 'spki', format: 'pem' },
  privateKeyEncoding: { type: 'pkcs8', format: 'pem' },
});

process.env.JWT_PUBLIC_KEY = publicKey;

// Helper function to sign RS256 JWT using native crypto module
function signServiceJwt(payload: object, privateKeyPem: string): string {
  const header = { alg: 'RS256', typ: 'JWT' };
  const base64UrlHeader = Buffer.from(JSON.stringify(header)).toString('base64url');
  const base64UrlPayload = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const signatureInput = `${base64UrlHeader}.${base64UrlPayload}`;
  const signature = sign('sha256', Buffer.from(signatureInput), privateKeyPem).toString(
    'base64url'
  );
  return `${signatureInput}.${signature}`;
}

vi.mock('../../../apps/catalog-service/src/infrastructure/db/client.js', () => {
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
      then: vi.fn((onFulfilled, onRejected) => {
        return Promise.resolve().then(getNextSelectMock).then(onFulfilled, onRejected);
      }),
    };
    return chain;
  };

  return {
    catalogDb: {
      select: vi.fn(createMockSelectChain),
    },
  };
});

describe('Internal Catalog Quote API & Decimal Price Precision (M2.1.2)', () => {
  let app: any;
  const gameIdPublished = '00000000-0000-0000-0000-000000000100';
  const gameIdDraft = '00000000-0000-0000-0000-000000000200';
  const gameIdNotFound = '00000000-0000-0000-0000-000000000999';

  let validServiceToken: string;
  let wrongAudienceToken: string;
  let missingScopeToken: string;

  beforeEach(() => {
    vi.clearAllMocks();
    (globalThis as any).selectMockQueue = [];
    app = createCatalogApp(async () => {});

    const now = Math.floor(Date.now() / 1000);

    validServiceToken = signServiceJwt(
      {
        sub: 'commerce-service',
        iss: 'hathor-auth-service',
        aud: 'catalog-service',
        scope: 'catalog.quote.read',
        scopes: ['catalog.quote.read'],
        iat: now,
        exp: now + 300,
      },
      privateKey
    );

    wrongAudienceToken = signServiceJwt(
      {
        sub: 'commerce-service',
        iss: 'hathor-auth-service',
        aud: 'library-service',
        scope: 'catalog.quote.read',
        scopes: ['catalog.quote.read'],
        iat: now,
        exp: now + 300,
      },
      privateKey
    );

    missingScopeToken = signServiceJwt(
      {
        sub: 'commerce-service',
        iss: 'hathor-auth-service',
        aud: 'catalog-service',
        scope: 'other.scope',
        scopes: ['other.scope'],
        iat: now,
        exp: now + 300,
      },
      privateKey
    );
  });

  describe('1. Authentication & Authorization (RS256 JWT & Scopes)', () => {
    it('rejects unauthenticated requests with 401 UNAUTHENTICATED', async () => {
      const res = await request(app).get(`/internal/v1/catalog/quotes/${gameIdPublished}`);
      expect(res.status).toBe(401);
      expect(res.body.error.code).toBe('UNAUTHENTICATED');
    });

    it('rejects tokens targeting wrong audience with 403 FORBIDDEN', async () => {
      const res = await request(app)
        .get(`/internal/v1/catalog/quotes/${gameIdPublished}`)
        .set('Authorization', `Bearer ${wrongAudienceToken}`);

      expect(res.status).toBe(403);
      expect(res.body.error.code).toBe('FORBIDDEN');
    });

    it('rejects tokens lacking catalog.quote.read scope with 403 FORBIDDEN', async () => {
      const res = await request(app)
        .get(`/internal/v1/catalog/quotes/${gameIdPublished}`)
        .set('Authorization', `Bearer ${missingScopeToken}`);

      expect(res.status).toBe(403);
      expect(res.body.error.code).toBe('FORBIDDEN');
    });
  });

  describe('2. Single Game Quote API (GET /internal/v1/catalog/quotes/:gameId)', () => {
    it('returns 400 VALIDATION_FAILED for invalid UUID format', async () => {
      const res = await request(app)
        .get('/internal/v1/catalog/quotes/not-a-valid-uuid')
        .set('Authorization', `Bearer ${validServiceToken}`);

      expect(res.status).toBe(400);
      expect(res.body.error.code).toBe('VALIDATION_FAILED');
    });

    it('returns 404 NOT_FOUND when game does not exist', async () => {
      (globalThis as any).selectMockQueue = [[]]; // empty array -> game not found

      const res = await request(app)
        .get(`/internal/v1/catalog/quotes/${gameIdNotFound}`)
        .set('Authorization', `Bearer ${validServiceToken}`);

      expect(res.status).toBe(404);
      expect(res.body.error.code).toBe('NOT_FOUND');
    });

    it('returns valid quote payload with sellable: true and formatted 2-decimal EGP price for published game', async () => {
      const updatedAt = new Date('2026-07-20T10:00:00Z');
      (globalThis as any).selectMockQueue = [
        [
          {
            id: gameIdPublished,
            title: 'Cyberpunk Quest',
            priceEgp: '299.9', // stored raw float/numeric in DB
            status: 'published',
            updatedAt,
          },
        ],
      ];

      const res = await request(app)
        .get(`/internal/v1/catalog/quotes/${gameIdPublished}`)
        .set('Authorization', `Bearer ${validServiceToken}`);

      expect(res.status).toBe(200);
      expect(res.body).toEqual({
        gameId: gameIdPublished,
        title: 'Cyberpunk Quest',
        priceEgp: '299.90', // formatted strictly with 2 decimals
        priceVersion: updatedAt.toISOString(),
        currency: 'EGP',
        sellable: true,
      });
      expect(res.body.priceEgp).toMatch(/^\d+\.\d{2}$/);
    });

    it('returns quote with sellable: false for unpublished (draft) game', async () => {
      (globalThis as any).selectMockQueue = [
        [
          {
            id: gameIdDraft,
            title: 'Unreleased Draft Game',
            priceEgp: 150,
            status: 'draft',
            updatedAt: null,
          },
        ],
      ];

      const res = await request(app)
        .get(`/internal/v1/catalog/quotes/${gameIdDraft}`)
        .set('Authorization', `Bearer ${validServiceToken}`);

      expect(res.status).toBe(200);
      expect(res.body).toEqual({
        gameId: gameIdDraft,
        title: 'Unreleased Draft Game',
        priceEgp: '150.00',
        priceVersion: 'v1',
        currency: 'EGP',
        sellable: false,
      });
    });
  });

  describe('3. Batch Game Quote API (POST /internal/v1/catalog/quotes)', () => {
    it('returns 422 for invalid body or empty gameIds array', async () => {
      const res = await request(app)
        .post('/internal/v1/catalog/quotes')
        .set('Authorization', `Bearer ${validServiceToken}`)
        .send({ gameIds: [] });

      expect(res.status).toBe(422);
      expect(res.body.error.code).toBe('VALIDATION_FAILED');
    });

    it('returns batch quote response for array of game IDs', async () => {
      const updatedAt = new Date('2026-07-22T12:00:00Z');
      (globalThis as any).selectMockQueue = [
        [
          {
            id: gameIdPublished,
            title: 'Cyberpunk Quest',
            priceEgp: '299.99',
            status: 'published',
            updatedAt,
          },
          {
            id: gameIdDraft,
            title: 'Unreleased Draft Game',
            priceEgp: '0.00',
            status: 'draft',
            updatedAt: null,
          },
        ],
      ];

      const res = await request(app)
        .post('/internal/v1/catalog/quotes')
        .set('Authorization', `Bearer ${validServiceToken}`)
        .send({ gameIds: [gameIdPublished, gameIdDraft, gameIdNotFound] });

      expect(res.status).toBe(200);
      expect(res.body.quoteId).toBeDefined();
      expect(res.body.expiresAt).toBeDefined();
      expect(res.body.items).toHaveLength(3);

      expect(res.body.items[0]).toEqual({
        gameId: gameIdPublished,
        title: 'Cyberpunk Quest',
        sellable: true,
        priceEgp: '299.99',
        currency: 'EGP',
        priceVersion: updatedAt.toISOString(),
      });

      expect(res.body.items[1]).toEqual({
        gameId: gameIdDraft,
        title: 'Unreleased Draft Game',
        sellable: false,
        priceEgp: '0.00',
        currency: 'EGP',
        priceVersion: 'v1',
      });

      expect(res.body.items[2]).toEqual({
        gameId: gameIdNotFound,
        title: 'Unknown',
        sellable: false,
        priceEgp: '0.00',
        currency: 'EGP',
        priceVersion: 'v1',
      });
    });
  });
});
