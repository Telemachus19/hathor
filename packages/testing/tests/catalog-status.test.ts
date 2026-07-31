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

  const createMockInsertChain = () => {
    const chain: any = {};
    chain.values = vi.fn(() => chain);
    return chain;
  };

  const createMockUpdateChain = () => {
    const chain: any = {};
    chain.set = vi.fn(() => chain);
    chain.where = vi.fn(() => Promise.resolve());
    return chain;
  };

  const mockTx = {
    select: vi.fn(createMockSelectChain),
    insert: vi.fn(createMockInsertChain),
    update: vi.fn(createMockUpdateChain),
  };

  (globalThis as any).mockTx = mockTx;

  return {
    catalogDb: {
      select: vi.fn(createMockSelectChain),
      insert: vi.fn(createMockInsertChain),
      transaction: vi.fn((callback) => callback(mockTx)),
    },
  };
});

import { catalogDb } from '../../../apps/catalog-service/src/infrastructure/db/client.js';

describe('Catalog Game Publication State Machine & Status Routes', () => {
  let app: any;
  const adminId = '00000000-0000-0000-0000-000000000001';
  const creatorId = '00000000-0000-0000-0000-000000000002';
  const gamerId = '00000000-0000-0000-0000-000000000003';
  const gameId = '00000000-0000-0000-0000-000000000010';

  let adminToken: string;
  let creatorToken: string;
  let gamerToken: string;

  beforeEach(() => {
    vi.clearAllMocks();
    (globalThis as any).selectMockQueue = [];
    app = createCatalogApp(async () => {});

    adminToken = signJwt(
      {
        sub: adminId,
        iss: 'hathor-auth-service',
        roles: ['gamer', 'creator', 'admin'],
        exp: Math.floor(Date.now() / 1000) + 900,
      },
      privateKey
    );

    creatorToken = signJwt(
      {
        sub: creatorId,
        iss: 'hathor-auth-service',
        roles: ['gamer', 'creator'],
        exp: Math.floor(Date.now() / 1000) + 900,
      },
      privateKey
    );

    gamerToken = signJwt(
      {
        sub: gamerId,
        iss: 'hathor-auth-service',
        roles: ['gamer'],
        exp: Math.floor(Date.now() / 1000) + 900,
      },
      privateKey
    );
  });

  describe('1. Authentication & Role Enforcement', () => {
    it('rejects unauthenticated status transition requests', async () => {
      const res = await request(app).patch(`/admin/games/${gameId}/status`).send({ status: 'published' });
      expect(res.status).toBe(401);
      expect(res.body.error.code).toBe('UNAUTHENTICATED');
    });

    it('rejects non-admin calling admin status route', async () => {
      const res = await request(app)
        .patch(`/admin/games/${gameId}/status`)
        .set('Authorization', `Bearer ${creatorToken}`)
        .send({ status: 'published' });

      expect(res.status).toBe(403);
      expect(res.body.error.code).toBe('FORBIDDEN');
    });

    it('rejects gamer calling creator status route', async () => {
      const res = await request(app)
        .patch(`/creator/games/${gameId}/status`)
        .set('Authorization', `Bearer ${gamerToken}`)
        .send({ status: 'pending_review' });

      expect(res.status).toBe(403);
      expect(res.body.error.code).toBe('FORBIDDEN');
    });
  });

  describe('2. Admin Game Status Route (PATCH /admin/games/:gameId/status)', () => {
    it('executes valid status transition (pending_review -> published) and records audit log', async () => {
      (globalThis as any).selectMockQueue = [
        [{ id: gameId, creatorId, status: 'pending_review' }], // Existing game lookup
      ];

      const res = await request(app)
        .patch(`/admin/games/${gameId}/status`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ status: 'published', reason: 'Approved after review' });

      expect(res.status).toBe(204);
      expect(catalogDb.transaction).toHaveBeenCalled();
      const mockTx = (globalThis as any).mockTx;
      expect(mockTx.update).toHaveBeenCalled();
      expect(mockTx.insert).toHaveBeenCalled();
    });

    it('rejects disallowed status transition (draft -> published) with 409 CONFLICT', async () => {
      (globalThis as any).selectMockQueue = [
        [{ id: gameId, creatorId, status: 'draft' }], // Existing game in draft state
      ];

      const res = await request(app)
        .patch(`/admin/games/${gameId}/status`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ status: 'published' });

      expect(res.status).toBe(409);
      expect(res.body.error.code).toBe('CONFLICT');
      expect(res.body.error.message).toContain("from 'draft' to 'published'");
    });

    it('returns 404 NOT_FOUND for non-existent game', async () => {
      (globalThis as any).selectMockQueue = [
        [], // Game not found
      ];

      const res = await request(app)
        .patch(`/admin/games/${gameId}/status`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ status: 'published' });

      expect(res.status).toBe(404);
      expect(res.body.error.code).toBe('NOT_FOUND');
    });

    it('returns 400 VALIDATION_FAILED for invalid status parameter', async () => {
      const res = await request(app)
        .patch(`/admin/games/${gameId}/status`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ status: 'invalid_status' });

      expect(res.status).toBe(400);
      expect(res.body.error.code).toBe('VALIDATION_FAILED');
    });
  });

  describe('3. Creator Game Status Route (PATCH /creator/games/:gameId/status)', () => {
    it('allows creator owner to submit draft game for review (draft -> pending_review)', async () => {
      (globalThis as any).selectMockQueue = [
        [{ id: gameId, creatorId, status: 'draft' }], // Game owned by creatorId
      ];

      const res = await request(app)
        .patch(`/creator/games/${gameId}/status`)
        .set('Authorization', `Bearer ${creatorToken}`)
        .send({ status: 'pending_review' });

      expect(res.status).toBe(204);
      expect(catalogDb.transaction).toHaveBeenCalled();
      const mockTx = (globalThis as any).mockTx;
      expect(mockTx.update).toHaveBeenCalled();
      expect(mockTx.insert).toHaveBeenCalled();
    });

    it('rejects creator attempting to publish directly (draft -> published)', async () => {
      (globalThis as any).selectMockQueue = [
        [{ id: gameId, creatorId, status: 'draft' }],
      ];

      const res = await request(app)
        .patch(`/creator/games/${gameId}/status`)
        .set('Authorization', `Bearer ${creatorToken}`)
        .send({ status: 'published' });

      expect(res.status).toBe(403);
      expect(res.body.error.code).toBe('FORBIDDEN');
      expect(res.body.error.message).toContain('Only Admins can set status to');
    });

    it('rejects creator attempting to modify another creator game', async () => {
      const otherCreatorId = '00000000-0000-0000-0000-000000000099';
      (globalThis as any).selectMockQueue = [
        [{ id: gameId, creatorId: otherCreatorId, status: 'draft' }],
      ];

      const res = await request(app)
        .patch(`/creator/games/${gameId}/status`)
        .set('Authorization', `Bearer ${creatorToken}`)
        .send({ status: 'pending_review' });

      expect(res.status).toBe(403);
      expect(res.body.error.code).toBe('FORBIDDEN');
      expect(res.body.error.message).toContain('You do not have permission');
    });
  });
});
