import { describe, expect, it, vi, beforeEach } from 'vitest';
import request from 'supertest';
import { generateKeyPairSync, sign } from 'node:crypto';

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

const mockSelectChain: any = {
  from: vi.fn(() => mockSelectChain),
  innerJoin: vi.fn(() => mockSelectChain),
  where: vi.fn(() => mockSelectChain),
  orderBy: vi.fn(() => mockSelectChain),
  limit: vi.fn(() => Promise.resolve([])),
  then: vi.fn((onFulfilled, onRejected) => {
    return Promise.resolve()
      .then(() => [])
      .then(onFulfilled, onRejected);
  }),
};

const mockUpdateChain: any = {
  set: vi.fn(() => mockUpdateChain),
  where: vi.fn(() => mockUpdateChain),
  returning: vi.fn(() => Promise.resolve([])),
  then: vi.fn((onFulfilled, onRejected) => {
    return Promise.resolve()
      .then(() => [])
      .then(onFulfilled, onRejected);
  }),
};

const mockInsertChain: any = {
  values: vi.fn(() => mockInsertChain),
  returning: vi.fn(() => Promise.resolve([])),
  onConflictDoNothing: vi.fn(() => Promise.resolve([])),
  then: vi.fn((onFulfilled, onRejected) => {
    return Promise.resolve()
      .then(() => [])
      .then(onFulfilled, onRejected);
  }),
};

vi.mock('../../../apps/catalog-service/src/infrastructure/db/client.js', () => {
  return {
    catalogDb: {
      select: vi.fn(() => mockSelectChain),
      update: vi.fn(() => mockUpdateChain),
      insert: vi.fn(() => mockInsertChain),
    },
  };
});

vi.mock('../../../apps/catalog-service/src/infrastructure/storage/r2Client.js', () => {
  return {
    uploadGameBuildPackage: vi.fn(async ({ objectKey, buffer }: any) => ({
      objectKey,
      checksumSha256: 'mock-sha256-checksum-1234567890abcdef',
      sizeBytes: buffer.length,
    })),
  };
});

import { createCatalogApp } from '../../../apps/catalog-service/src/app.js';
import { catalogDb } from '../../../apps/catalog-service/src/infrastructure/db/client.js';
import { uploadGameBuildPackage } from '../../../apps/catalog-service/src/infrastructure/storage/r2Client.js';

describe('PUT /creator/games/:gameId/theme - Creator Authorization & Ownership Verification', () => {
  let app: any;

  beforeEach(() => {
    vi.clearAllMocks();
    mockSelectChain.from.mockReturnValue(mockSelectChain);
    mockSelectChain.innerJoin.mockReturnValue(mockSelectChain);
    mockSelectChain.where.mockReturnValue(mockSelectChain);
    mockSelectChain.orderBy.mockReturnValue(mockSelectChain);
    mockSelectChain.limit.mockResolvedValue([]);
    mockUpdateChain.set.mockReturnValue(mockUpdateChain);
    mockUpdateChain.where.mockReturnValue(mockUpdateChain);
    mockInsertChain.values.mockReturnValue(mockInsertChain);
    mockInsertChain.returning.mockResolvedValue([]);
    mockInsertChain.onConflictDoNothing.mockResolvedValue([]);
    app = createCatalogApp(async () => {});
  });

  const creatorAId = 'creator-uuid-aaa';
  const creatorBId = 'creator-uuid-bbb';

  const tokenCreatorA = signJwt(
    {
      sub: creatorAId,
      iss: 'hathor-auth-service',
      aud: 'hathor-services',
      roles: ['creator'],
      exp: Math.floor(Date.now() / 1000) + 900,
    },
    privateKey
  );

  const tokenCreatorB = signJwt(
    {
      sub: creatorBId,
      iss: 'hathor-auth-service',
      aud: 'hathor-services',
      roles: ['creator'],
      exp: Math.floor(Date.now() / 1000) + 900,
    },
    privateKey
  );

  it('rejects unauthenticated requests with 401 Unauthorized', async () => {
    const res = await request(app)
      .put('/creator/games/super-action-game/theme')
      .send({ primaryColor: '#f26b21' });

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('UNAUTHENTICATED');
  });

  it('rejects with 404 Not Found if game slug does not exist', async () => {
    mockSelectChain.limit.mockResolvedValueOnce([]);

    const res = await request(app)
      .put('/creator/games/non-existent-slug/theme')
      .set('Authorization', `Bearer ${tokenCreatorA}`)
      .send({ primaryColor: '#f26b21' });

    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('GAME_NOT_FOUND');
  });

  it('rejects unauthorized access with HTTP 403 Forbidden when Creator B attempts to update Creator A game by slug (IDOR protection)', async () => {
    // Game is owned by Creator A
    mockSelectChain.limit.mockResolvedValueOnce([
      {
        id: 'game-123',
        slug: 'super-action-game',
        creatorId: creatorAId,
        title: 'Super Action Game',
        pageTheme: {},
      },
    ]);

    // Request sent by Creator B
    const res = await request(app)
      .put('/creator/games/super-action-game/theme')
      .set('Authorization', `Bearer ${tokenCreatorB}`)
      .send({ primaryColor: '#ff0000' });

    expect(res.status).toBe(403);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('FORBIDDEN');
    expect(res.body.error.message).toContain('Creator ownership verification failed');
    expect(catalogDb.update).not.toHaveBeenCalled();
  });

  it('succeeds with 200 OK when Creator A updates their own game theme using game slug', async () => {
    // Game is owned by Creator A
    mockSelectChain.limit.mockResolvedValueOnce([
      {
        id: 'game-123',
        slug: 'super-action-game',
        creatorId: creatorAId,
        title: 'Super Action Game',
        pageTheme: {},
      },
    ]);

    const newTheme = {
      pageSettings: { accentColor: '#f26b21' },
      sections: [],
    };

    // Request sent by Creator A with slug parameter
    const res = await request(app)
      .put('/creator/games/super-action-game/theme')
      .set('Authorization', `Bearer ${tokenCreatorA}`)
      .send(newTheme);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.gameId).toBe('game-123');
    expect(res.body.data.slug).toBe('super-action-game');
    expect(res.body.data.pageTheme).toEqual(newTheme);
    expect(catalogDb.update).toHaveBeenCalled();
  });

  it('rejects invalid theme JSON payload with 400 Bad Request and VALIDATION_FAILED', async () => {
    // Game is owned by Creator A
    mockSelectChain.limit.mockResolvedValueOnce([
      {
        id: 'game-123',
        slug: 'super-action-game',
        creatorId: creatorAId,
        title: 'Super Action Game',
        pageTheme: {},
      },
    ]);

    const invalidTheme = {
      sections: [
        {
          id: 'sec_1',
          type: 'about-game',
          aboutSections: [
            {
              title: 'Malicious',
              text: '<script>alert("XSS")</script>',
            },
          ],
        },
      ],
    };

    const res = await request(app)
      .put('/creator/games/super-action-game/theme')
      .set('Authorization', `Bearer ${tokenCreatorA}`)
      .send(invalidTheme);

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('VALIDATION_FAILED');
    expect(res.body.error.details.some((e: any) => e.code === 'SECURITY_VIOLATION')).toBe(true);
    expect(catalogDb.update).not.toHaveBeenCalled();
  });
});

describe('POST /creator/games - Draft Game Creation & Build Upload', () => {
  let app: any;

  beforeEach(() => {
    vi.clearAllMocks();
    mockInsertChain.values.mockReturnValue(mockInsertChain);
    mockInsertChain.returning.mockResolvedValue([]);
    app = createCatalogApp(async () => {});
  });

  const creatorAId = 'creator-uuid-aaa';
  const tokenCreatorA = signJwt(
    {
      sub: creatorAId,
      iss: 'hathor-auth-service',
      aud: 'hathor-services',
      roles: ['creator'],
      exp: Math.floor(Date.now() / 1000) + 900,
    },
    privateKey
  );

  it('rejects unauthenticated creation requests with 401', async () => {
    const res = await request(app).post('/creator/games').send({ title: 'New Game' });

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('UNAUTHENTICATED');
  });

  it('rejects requests missing game title with 400 Bad Request', async () => {
    const res = await request(app)
      .post('/creator/games')
      .set('Authorization', `Bearer ${tokenCreatorA}`)
      .send({ shortDescription: 'No title provided' });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('BAD_REQUEST');
  });

  it('successfully creates draft game enforcing status="draft" and pageTheme={}', async () => {
    const insertedRecord = {
      id: '00000000-0000-0000-0000-000000000123',
      creatorId: creatorAId,
      title: 'Hathor Quest',
      slug: 'hathor-quest-a1b2',
      shortDescription: 'Epic RPG Adventure',
      fullDescription: 'Epic RPG Adventure',
      priceEgp: '149.99',
      discountPercent: 0,
      bannerUrl: 'https://example.com/banner.png',
      screenshots: [],
      trailerUrl: null,
      systemRequirements: {},
      pageTheme: {},
      status: 'draft',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    mockInsertChain.returning.mockResolvedValueOnce([insertedRecord]);

    const res = await request(app)
      .post('/creator/games')
      .set('Authorization', `Bearer ${tokenCreatorA}`)
      .send({
        title: 'Hathor Quest',
        shortDescription: 'Epic RPG Adventure',
        priceEgp: '149.99',
        bannerUrl: 'https://example.com/banner.png',
        // Attempt to pass custom status/theme to test enforcement override
        status: 'published',
        pageTheme: { primaryColor: '#ff0000' },
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.status).toBe('draft');
    expect(res.body.data.pageTheme).toEqual({});

    // Verify DB insert received status="draft" and pageTheme={}
    const insertedValues = mockInsertChain.values.mock.calls[0][0];
    expect(insertedValues.creatorId).toBe(creatorAId);
    expect(insertedValues.title).toBe('Hathor Quest');
    expect(insertedValues.status).toBe('draft');
    expect(insertedValues.pageTheme).toEqual({});
  });

  it('uploads build package during multipart game creation and stores objectKey format builds/:gameId/v1.0.0/game.zip', async () => {
    const targetGameId = '00000000-0000-0000-0000-000000000123';
    const insertedRecord = {
      id: targetGameId,
      creatorId: creatorAId,
      title: 'Cyber Quest',
      slug: 'cyber-quest-1234',
      shortDescription: 'Cyber action game',
      fullDescription: 'Cyber action game',
      priceEgp: '199.99',
      status: 'draft',
      pageTheme: {},
    };

    mockInsertChain.returning.mockResolvedValueOnce([insertedRecord]);
    mockSelectChain.limit.mockResolvedValueOnce([]); // No existing build

    const res = await request(app)
      .post('/creator/games')
      .set('Authorization', `Bearer ${tokenCreatorA}`)
      .field('title', 'Cyber Quest')
      .field('shortDesc', 'Cyber action game')
      .field('priceEgp', '199.99')
      .attach('build', Buffer.from('mock zip binary content'), 'game-package.zip');

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(uploadGameBuildPackage).toHaveBeenCalledWith({
      objectKey: `builds/${targetGameId}/v1.0.0/game.zip`,
      buffer: expect.any(Buffer),
      contentType: 'application/zip',
    });
    expect(res.body.data.build).toEqual({
      objectKey: `builds/${targetGameId}/v1.0.0/game.zip`,
      checksumSha256: 'mock-sha256-checksum-1234567890abcdef',
      sizeBytes: expect.any(Number),
    });
  });

  it('uploads build package via POST /creator/games/:gameId/build', async () => {
    const targetGameId = '00000000-0000-0000-0000-000000000123';
    mockSelectChain.limit.mockResolvedValueOnce([
      {
        id: targetGameId,
        creatorId: creatorAId,
        title: 'Cyber Quest',
      },
    ]);
    mockSelectChain.limit.mockResolvedValueOnce([]); // existing build check

    const res = await request(app)
      .post(`/creator/games/${targetGameId}/build`)
      .set('Authorization', `Bearer ${tokenCreatorA}`)
      .attach('file', Buffer.from('mock new build data'), 'build.zip');

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.objectKey).toBe(`builds/${targetGameId}/v1.0.0/game.zip`);
  });
});
