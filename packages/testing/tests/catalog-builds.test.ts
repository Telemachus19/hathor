import { describe, expect, it, vi, beforeEach } from 'vitest';
import request from 'supertest';
import { generateKeyPairSync, sign } from 'node:crypto';
import { createCatalogApp } from '../../../apps/catalog-service/src/app.js';
import { computeSha256 } from '../../../apps/catalog-service/src/infrastructure/storage/r2Client.js';

// Generate a real RS256 key pair for the test suite
const { privateKey, publicKey } = generateKeyPairSync('rsa', {
  modulusLength: 2048,
  publicKeyEncoding: { type: 'spki', format: 'pem' },
  privateKeyEncoding: { type: 'pkcs8', format: 'pem' },
});

process.env.JWT_PUBLIC_KEY = publicKey;

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
      orderBy: vi.fn(() => chain),
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

describe('Issue M4.1: Seed Immutable Cloudflare R2 Build And Catalog Metadata', () => {
  let app: any;
  const gameIdWithBuild = '00000000-0000-0000-0000-000000000101';
  const gameIdWithoutBuild = '00000000-0000-0000-0000-000000000999';
  const mockBuildId = 'b0000000-0000-0000-0000-000000000001';

  let validBuildReadToken: string;
  let missingScopeToken: string;

  beforeEach(() => {
    vi.clearAllMocks();
    (globalThis as any).selectMockQueue = [];
    app = createCatalogApp(async () => {});

    const now = Math.floor(Date.now() / 1000);

    validBuildReadToken = signServiceJwt(
      {
        sub: 'library-service',
        iss: 'hathor-auth-service',
        aud: 'catalog-service',
        scope: 'catalog.build.read',
        scopes: ['catalog.build.read'],
        iat: now,
        exp: now + 300,
      },
      privateKey
    );

    missingScopeToken = signServiceJwt(
      {
        sub: 'library-service',
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

  describe('1. SHA-256 Checksum Computation & Key Formatting', () => {
    it('computes exact 64-character hex SHA-256 checksum for binary buffers', () => {
      const sampleBuffer = Buffer.from('Hathor Demo Binary Package 2026');
      const checksum = computeSha256(sampleBuffer);
      expect(checksum).toHaveLength(64);
      expect(checksum).toMatch(/^[a-f0-9]{64}$/);
    });
  });

  describe('2. Internal Published Build API (GET /internal/v1/catalog/games/:gameId/published-build)', () => {
    it('rejects requests missing catalog.build.read scope with 403 FORBIDDEN', async () => {
      const res = await request(app)
        .get(`/internal/v1/catalog/games/${gameIdWithBuild}/published-build`)
        .set('Authorization', `Bearer ${missingScopeToken}`);

      expect(res.status).toBe(403);
      expect(res.body.error.code).toBe('FORBIDDEN');
    });

    it('returns 400 VALIDATION_FAILED for malformed gameId UUID', async () => {
      const res = await request(app)
        .get('/internal/v1/catalog/games/invalid-uuid-format/published-build')
        .set('Authorization', `Bearer ${validBuildReadToken}`);

      expect(res.status).toBe(400);
      expect(res.body.error.code).toBe('VALIDATION_FAILED');
    });

    it('returns 404 NOT_FOUND when no published build exists for gameId', async () => {
      (globalThis as any).selectMockQueue = [[]];

      const res = await request(app)
        .get(`/internal/v1/catalog/games/${gameIdWithoutBuild}/published-build`)
        .set('Authorization', `Bearer ${validBuildReadToken}`);

      expect(res.status).toBe(404);
      expect(res.body.error.code).toBe('NOT_FOUND');
    });

    it('returns published build metadata matching exact immutable key format builds/:gameId/:version/game.zip', async () => {
      const mockSha256 = 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855';
      const mockObjectKey = `builds/${gameIdWithBuild}/v1.0.0/game.zip`;

      (globalThis as any).selectMockQueue = [
        [
          {
            id: mockBuildId,
            gameId: gameIdWithBuild,
            version: 'v1.0.0',
            objectKey: mockObjectKey,
            checksumSha256: mockSha256,
            sizeBytes: 154200,
            state: 'published',
          },
        ],
      ];

      const res = await request(app)
        .get(`/internal/v1/catalog/games/${gameIdWithBuild}/published-build`)
        .set('Authorization', `Bearer ${validBuildReadToken}`);

      expect(res.status).toBe(200);
      expect(res.body).toEqual({
        buildId: mockBuildId,
        gameId: gameIdWithBuild,
        version: 'v1.0.0',
        objectKey: mockObjectKey,
        sha256: mockSha256,
        sizeBytes: 154200,
        state: 'published',
      });
      expect(res.body.objectKey).toMatch(/^builds\/[0-9a-f-]+\/v1\.0\.0\/game\.zip$/);
    });
  });
});
