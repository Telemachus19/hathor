import { describe, expect, it, vi, beforeEach } from 'vitest';
import request from 'supertest';
import jwt from 'jsonwebtoken';

const mockSelectChain: any = {};
mockSelectChain.from = vi.fn().mockReturnValue(mockSelectChain);
mockSelectChain.where = vi.fn().mockReturnValue(mockSelectChain);
mockSelectChain.limit = vi.fn().mockResolvedValue([]);

const mockUpdateChain: any = {};
mockUpdateChain.set = vi.fn().mockReturnValue(mockUpdateChain);
mockUpdateChain.where = vi.fn().mockResolvedValue(true);

const mockInsertChain: any = {};
mockInsertChain.values = vi.fn().mockReturnValue(mockInsertChain);
mockInsertChain.returning = vi.fn();

vi.mock('../../../apps/catalog-service/src/infrastructure/db/client.js', () => {
  return {
    catalogDb: {
      select: vi.fn(() => mockSelectChain),
      update: vi.fn(() => mockUpdateChain),
      insert: vi.fn(() => mockInsertChain),
    },
  };
});

import { createCatalogApp } from '../../../apps/catalog-service/src/app.js';
import { catalogDb } from '../../../apps/catalog-service/src/infrastructure/db/client.js';

describe('PUT /creator/games/:gameId/theme - Creator Authorization & Ownership Verification', () => {
  let app: any;

  beforeEach(() => {
    vi.clearAllMocks();
    mockSelectChain.from.mockReturnValue(mockSelectChain);
    mockSelectChain.where.mockReturnValue(mockSelectChain);
    mockSelectChain.limit.mockResolvedValue([]);
    mockUpdateChain.set.mockReturnValue(mockUpdateChain);
    mockUpdateChain.where.mockResolvedValue(true);
    mockInsertChain.values.mockReturnValue(mockInsertChain);
    mockInsertChain.returning.mockResolvedValue([]);
    app = createCatalogApp(async () => {});
  });

  const creatorAId = 'creator-uuid-aaa';
  const creatorBId = 'creator-uuid-bbb';

  const tokenCreatorA = jwt.sign(
    { sub: creatorAId, roles: ['creator'] },
    'secret-key'
  );

  const tokenCreatorB = jwt.sign(
    { sub: creatorBId, roles: ['creator'] },
    'secret-key'
  );

  it('rejects unauthenticated requests with 401 Unauthorized', async () => {
    const res = await request(app)
      .put('/creator/games/game-123/theme')
      .send({ primaryColor: '#f26b21' });

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('UNAUTHENTICATED');
  });

  it('rejects with 404 Not Found if game does not exist', async () => {
    mockSelectChain.limit.mockResolvedValueOnce([]);

    const res = await request(app)
      .put('/creator/games/non-existent-game/theme')
      .set('Authorization', `Bearer ${tokenCreatorA}`)
      .send({ primaryColor: '#f26b21' });

    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('GAME_NOT_FOUND');
  });

  it('rejects unauthorized access with HTTP 403 Forbidden when Creator B attempts to update Creator A game (IDOR protection)', async () => {
    // Game is owned by Creator A
    mockSelectChain.limit.mockResolvedValueOnce([
      {
        id: 'game-123',
        creatorId: creatorAId,
        title: 'Super Action Game',
        pageTheme: {},
      },
    ]);

    // Request sent by Creator B
    const res = await request(app)
      .put('/creator/games/game-123/theme')
      .set('Authorization', `Bearer ${tokenCreatorB}`)
      .send({ primaryColor: '#ff0000' });

    expect(res.status).toBe(403);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('FORBIDDEN');
    expect(res.body.error.message).toContain('Creator ownership verification failed');
    expect(catalogDb.update).not.toHaveBeenCalled();
  });

  it('succeeds with 200 OK when Creator A updates their own game theme', async () => {
    // Game is owned by Creator A
    mockSelectChain.limit.mockResolvedValueOnce([
      {
        id: 'game-123',
        creatorId: creatorAId,
        title: 'Super Action Game',
        pageTheme: {},
      },
    ]);

    const newTheme = { primaryColor: '#f26b21', mode: 'dark' };

    // Request sent by Creator A
    const res = await request(app)
      .put('/creator/games/game-123/theme')
      .set('Authorization', `Bearer ${tokenCreatorA}`)
      .send(newTheme);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.gameId).toBe('game-123');
    expect(res.body.data.pageTheme).toEqual(newTheme);
    expect(catalogDb.update).toHaveBeenCalled();
  });
});

describe('POST /creator/games - Draft Game Creation', () => {
  let app: any;

  beforeEach(() => {
    vi.clearAllMocks();
    mockInsertChain.values.mockReturnValue(mockInsertChain);
    mockInsertChain.returning.mockResolvedValue([]);
    app = createCatalogApp(async () => {});
  });

  const creatorAId = 'creator-uuid-aaa';
  const tokenCreatorA = jwt.sign(
    { sub: creatorAId, roles: ['creator'] },
    'secret-key'
  );

  it('rejects unauthenticated creation requests with 401', async () => {
    const res = await request(app)
      .post('/creator/games')
      .send({ title: 'New Game' });

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
      id: 'new-game-uuid-123',
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
});
