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

function signJwt(payload: object, privateKeyPem: string): string {
  const header = { alg: 'RS256', typ: 'JWT' };
  const base64UrlHeader = Buffer.from(JSON.stringify(header)).toString('base64url');
  const base64UrlPayload = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const signatureInput = `${base64UrlHeader}.${base64UrlPayload}`;
  const signature = sign('sha256', Buffer.from(signatureInput), privateKeyPem).toString('base64url');
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
      innerJoin: vi.fn(() => chain),
      leftJoin: vi.fn(() => chain),
      where: vi.fn(() => chain),
      orderBy: vi.fn(() => chain),
      limit: vi.fn(() => chain),
      then: vi.fn((onFulfilled, onRejected) => {
        return Promise.resolve().then(getNextSelectMock).then(onFulfilled, onRejected);
      }),
    };
    return chain;
  };

  const createMockInsertChain = () => {
    const chain: any = {};
    chain.values = vi.fn(() => chain);
    chain.returning = vi.fn(() => Promise.resolve([{ id: 'rev-new', sentiment: 'positive', content: 'Great!' }]));
    chain.then = vi.fn((onFulfilled, onRejected) => {
      return Promise.resolve([{ id: 'rev-new' }]).then(onFulfilled, onRejected);
    });
    return chain;
  };

  const createMockUpdateChain = () => {
    const chain: any = {};
    chain.set = vi.fn(() => chain);
    chain.where = vi.fn(() => chain);
    chain.returning = vi.fn(() => Promise.resolve([{ id: 'rev-1', sentiment: 'mixed', content: 'Updated content' }]));
    return chain;
  };

  return {
    catalogDb: {
      select: vi.fn(() => createMockSelectChain()),
      selectDistinct: vi.fn(() => createMockSelectChain()),
      insert: vi.fn(() => createMockInsertChain()),
      update: vi.fn(() => createMockUpdateChain()),
    },
  };
});

describe('Catalog Reviews Endpoints', () => {
  const ready = vi.fn(async () => {});
  const app = createCatalogApp(ready);

  const testUserId = '11111111-1111-1111-1111-111111111111';
  const validUserToken = signJwt(
    {
      sub: testUserId,
      roles: ['gamer'],
      iss: 'hathor-auth-service',
      aud: 'hathor-services',
      exp: Math.floor(Date.now() / 1000) + 3600,
    },
    privateKey
  );

  const nonUserToken = signJwt(
    {
      sub: testUserId,
      roles: ['guest'],
      iss: 'hathor-auth-service',
      aud: 'hathor-services',
      exp: Math.floor(Date.now() / 1000) + 3600,
    },
    privateKey
  );

  beforeEach(() => {
    (globalThis as any).selectMockQueue = [];
    vi.clearAllMocks();
  });

  describe('GET /store/games/:slug/reviews', () => {
    it('returns empty reviews list and zero breakdown when game has no reviews', async () => {
      (globalThis as any).selectMockQueue = [
        [{ id: 'game-123', title: 'Test Game', slug: 'test-game', status: 'published' }],
        [],
      ];

      const res = await request(app).get('/store/games/test-game/reviews');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.reviews).toEqual([]);
      expect(res.body.data.totalReviews).toBe(0);
      expect(res.body.data.breakdown).toEqual([
        { sentiment: 'positive', label: 'Positive', count: 0, percent: 0 },
        { sentiment: 'mixed', label: 'Mixed', count: 0, percent: 0 },
        { sentiment: 'negative', label: 'Negative', count: 0, percent: 0 },
      ]);
    });

    it('calculates correct percentages when reviews exist', async () => {
      (globalThis as any).selectMockQueue = [
        [{ id: 'game-123', title: 'Test Game', slug: 'test-game', status: 'published' }],
        [
          { id: 'r1', userId: 'u1', sentiment: 'positive', content: 'Super' },
          { id: 'r2', userId: 'u2', sentiment: 'positive', content: 'Awesome' },
          { id: 'r3', userId: 'u3', sentiment: 'mixed', content: 'Decent' },
          { id: 'r4', userId: 'u4', sentiment: 'negative', content: 'Bad' },
        ],
      ];

      const res = await request(app).get('/store/games/test-game/reviews');
      expect(res.status).toBe(200);
      expect(res.body.data.totalReviews).toBe(4);
      expect(res.body.data.breakdown[0]).toEqual({
        sentiment: 'positive',
        label: 'Positive',
        count: 2,
        percent: 50,
      });
      expect(res.body.data.breakdown[1]).toEqual({
        sentiment: 'mixed',
        label: 'Mixed',
        count: 1,
        percent: 25,
      });
      expect(res.body.data.breakdown[2]).toEqual({
        sentiment: 'negative',
        label: 'Negative',
        count: 1,
        percent: 25,
      });
    });

    it('returns 404 if game does not exist', async () => {
      (globalThis as any).selectMockQueue = [[]];

      const res = await request(app).get('/store/games/non-existent/reviews');
      expect(res.status).toBe(404);
      expect(res.body.error.code).toBe('GAME_NOT_FOUND');
    });
  });

  describe('GET /store/games/:slug/reviews/mine', () => {
    it('returns 401 if unauthenticated', async () => {
      const res = await request(app).get('/store/games/test-game/reviews/mine');
      expect(res.status).toBe(401);
    });

    it('returns 403 if user lacks "user" role', async () => {
      const res = await request(app)
        .get('/store/games/test-game/reviews/mine')
        .set('Authorization', `Bearer ${nonUserToken}`);
      expect(res.status).toBe(403);
    });

    it('returns user review if found', async () => {
      (globalThis as any).selectMockQueue = [
        [{ id: 'game-123', title: 'Test Game', slug: 'test-game', status: 'published' }],
        [{ id: 'r1', userId: testUserId, sentiment: 'positive', content: 'My review' }],
      ];

      const res = await request(app)
        .get('/store/games/test-game/reviews/mine')
        .set('Authorization', `Bearer ${validUserToken}`);
      expect(res.status).toBe(200);
      expect(res.body.data.review.id).toBe('r1');
      expect(res.body.data.review.sentiment).toBe('positive');
    });

    it('returns null if user has not reviewed yet', async () => {
      (globalThis as any).selectMockQueue = [
        [{ id: 'game-123', title: 'Test Game', slug: 'test-game', status: 'published' }],
        [],
      ];

      const res = await request(app)
        .get('/store/games/test-game/reviews/mine')
        .set('Authorization', `Bearer ${validUserToken}`);
      expect(res.status).toBe(200);
      expect(res.body.data.review).toBeNull();
    });
  });

  describe('POST /store/games/:slug/reviews', () => {
    it('rejects invalid sentiment', async () => {
      const res = await request(app)
        .post('/store/games/test-game/reviews')
        .set('Authorization', `Bearer ${validUserToken}`)
        .send({ sentiment: 'super-positive', content: 'Great!' });

      expect(res.status).toBe(400);
      expect(res.body.error.code).toBe('INVALID_SENTIMENT');
    });

    it('rejects empty review content', async () => {
      const res = await request(app)
        .post('/store/games/test-game/reviews')
        .set('Authorization', `Bearer ${validUserToken}`)
        .send({ sentiment: 'positive', content: '   ' });

      expect(res.status).toBe(400);
      expect(res.body.error.code).toBe('INVALID_CONTENT');
    });

    it('successfully posts a new review when user has no existing review', async () => {
      (globalThis as any).selectMockQueue = [
        [{ id: 'game-123', title: 'Test Game', slug: 'test-game', status: 'published' }],
        [], // No existing review
      ];

      const res = await request(app)
        .post('/store/games/test-game/reviews')
        .set('Authorization', `Bearer ${validUserToken}`)
        .send({ sentiment: 'positive', content: 'Great experience!' });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.review).toBeDefined();
    });

    it('updates existing review when user already reviewed the game', async () => {
      (globalThis as any).selectMockQueue = [
        [{ id: 'game-123', title: 'Test Game', slug: 'test-game', status: 'published' }],
        [{ id: 'rev-1' }], // Existing review found
      ];

      const res = await request(app)
        .post('/store/games/test-game/reviews')
        .set('Authorization', `Bearer ${validUserToken}`)
        .send({ sentiment: 'mixed', content: 'Updated content' });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.review.sentiment).toBe('mixed');
    });
  });
});
