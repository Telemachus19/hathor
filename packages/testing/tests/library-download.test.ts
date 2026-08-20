import { describe, expect, it, vi, beforeEach } from 'vitest';
import request from 'supertest';
import { generateKeyPairSync, sign } from 'node:crypto';
import { createLibraryApp } from '../../../apps/library-service/src/app.js';
import { getPublishedBuild } from '../../../apps/library-service/src/infrastructure/clients/catalog.js';

// Generate key pair for JWT signing
const { privateKey, publicKey } = generateKeyPairSync('rsa', {
  modulusLength: 2048,
  publicKeyEncoding: { type: 'spki', format: 'pem' },
  privateKeyEncoding: { type: 'pkcs8', format: 'pem' },
});

process.env.JWT_PUBLIC_KEY = publicKey;

// Mock database client in library-service
vi.mock('../../../apps/library-service/src/infrastructure/db/client.js', () => {
  const getNextSelectMock = () => {
    const queue = (globalThis as any).librarySelectMockQueue;
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

  const mockInsertValueChain = () => {
    const chain: any = {
      values: vi.fn(() => chain),
      then: vi.fn((onFulfilled, onRejected) => {
        return Promise.resolve()
          .then(() => ({}))
          .then(onFulfilled, onRejected);
      }),
    };
    return chain;
  };

  return {
    libraryDb: {
      select: vi.fn(createMockSelectChain),
      insert: vi.fn(mockInsertValueChain),
    },
  };
});

// Mock inter-service catalog client
vi.mock('../../../apps/library-service/src/infrastructure/clients/catalog.js', () => {
  return {
    getPublishedBuild: vi.fn(),
    DependencyUnavailableError: class DependencyUnavailableError extends Error {
      constructor(msg: string) {
        super(msg);
        this.name = 'DependencyUnavailableError';
      }
    },
  };
});

function signUserJwt(payload: object, privateKeyPem: string): string {
  const header = { alg: 'RS256', typ: 'JWT' };
  const base64UrlHeader = Buffer.from(JSON.stringify(header)).toString('base64url');
  const base64UrlPayload = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const signatureInput = `${base64UrlHeader}.${base64UrlPayload}`;
  const signature = sign('sha256', Buffer.from(signatureInput), privateKeyPem).toString(
    'base64url'
  );
  return `${signatureInput}.${signature}`;
}

describe('POST /inventory/games/:gameId/download - Download Authorization', () => {
  let app: any;
  const gameId = '00000000-0000-0000-0000-000000000101';
  const userId = '11111111-1111-1111-1111-111111111111';
  let validUserToken: string;

  beforeEach(() => {
    vi.clearAllMocks();
    (globalThis as any).librarySelectMockQueue = [];
    app = createLibraryApp(async () => {});

    const now = Math.floor(Date.now() / 1000);
    validUserToken = signUserJwt(
      {
        sub: userId,
        iss: 'hathor-auth-service',
        aud: 'hathor-services',
        iat: now,
        exp: now + 300,
      },
      privateKey
    );
  });

  it('rejects unauthenticated requests with 401 UNAUTHENTICATED', async () => {
    const res = await request(app).post(`/inventory/games/${gameId}/download`);
    expect(res.status).toBe(401);
    expect(res.body.error.code).toBe('UNAUTHENTICATED');
  });

  it('rejects requests for unowned games with 403 FORBIDDEN', async () => {
    // Mock userLicenses select returns empty array (unowned)
    (globalThis as any).librarySelectMockQueue = [[]];

    const res = await request(app)
      .post(`/inventory/games/${gameId}/download`)
      .set('Authorization', `Bearer ${validUserToken}`);

    expect(res.status).toBe(403);
    expect(res.body.error.code).toBe('FORBIDDEN');
    expect(res.body.error.message).toContain('User does not own this game');
  });

  it('rejects suspended game download requests with 403 FORBIDDEN', async () => {
    // Mock userLicenses select returns ownership license
    (globalThis as any).librarySelectMockQueue = [[{ gameId }]];

    // Mock catalog service throws GAME_SUSPENDED_OR_REVOKED
    vi.mocked(getPublishedBuild).mockRejectedValue(new Error('GAME_SUSPENDED_OR_REVOKED'));

    const res = await request(app)
      .post(`/inventory/games/${gameId}/download`)
      .set('Authorization', `Bearer ${validUserToken}`);

    expect(res.status).toBe(403);
    expect(res.body.error.code).toBe('FORBIDDEN');
    expect(res.body.error.message).toContain('Game publication is suspended');
  });

  it('returns 404 NOT_FOUND when no published build exists', async () => {
    // Mock userLicenses select returns ownership license
    (globalThis as any).librarySelectMockQueue = [[{ gameId }]];

    // Mock catalog service returns null (no build found)
    vi.mocked(getPublishedBuild).mockResolvedValue(null);

    const res = await request(app)
      .post(`/inventory/games/${gameId}/download`)
      .set('Authorization', `Bearer ${validUserToken}`);

    expect(res.status).toBe(404);
    expect(res.body.error.code).toBe('NOT_FOUND');
  });

  it('successfully authorizes download and returns presigned URL and SHA-256', async () => {
    // Mock userLicenses select returns ownership license
    (globalThis as any).librarySelectMockQueue = [[{ gameId }]];

    // Mock catalog service returns published build
    const mockSha256 = 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855';
    vi.mocked(getPublishedBuild).mockResolvedValue({
      buildId: 'mock-build-id',
      gameId,
      version: 'v1.0.0',
      objectKey: `builds/${gameId}/v1.0.0/game.zip`,
      sha256: mockSha256,
      sizeBytes: 1048576,
      state: 'published',
    });

    const res = await request(app)
      .post(`/inventory/games/${gameId}/download`)
      .set('Authorization', `Bearer ${validUserToken}`);

    expect(res.status).toBe(200);
    expect(res.body.url).toContain('http://127.0.0.1:9000/hathor-builds/builds/');
    expect(res.body.sha256).toBe(mockSha256);
    expect(res.body.expiresAt).toBeDefined();
  });
});
