import { describe, expect, it, vi, beforeEach } from 'vitest';
import request from 'supertest';
import { createAuthApp } from '../src/app.js';
import { generateAccessToken } from '../src/domain/token.js';

const mockSelectChain = {
  from: vi.fn().mockReturnThis(),
  where: vi.fn().mockReturnThis(),
  limit: vi.fn(),
};

const mockInsertChain = {
  values: vi.fn().mockResolvedValue([]),
};

const mockUpdateChain = {
  set: vi.fn().mockReturnThis(),
  where: vi.fn().mockReturnThis(),
  returning: vi.fn(),
};

const mockTx = {
  select: vi.fn(() => mockSelectChain),
  update: vi.fn(() => mockUpdateChain),
  insert: vi.fn(() => mockInsertChain),
};

vi.mock('../src/infrastructure/db/client.js', () => {
  return {
    authDb: {
      select: vi.fn(() => mockSelectChain),
      transaction: vi.fn((callback) => callback(mockTx)),
    },
  };
});

import { authDb } from '../src/infrastructure/db/client.js';

// Real UUIDs for tests
const ADMIN_ID = 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11';
const GAMER_ID = 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22';
const TARGET_ID = '14ab3487-6415-4054-a491-df3acd7a15bf';
const NONEXISTENT_ID = '24ab3487-6415-4054-a491-df3acd7a15bf';

describe('PUT /:userId/roles', () => {
  let app: any;

  beforeEach(() => {
    vi.clearAllMocks();
    app = createAuthApp(async () => {});
  });

  it('allows admins to change roles inside a transaction and log audit trail', async () => {
    const adminToken = generateAccessToken({
      id: ADMIN_ID,
      roles: ['admin'],
      authorizationVersion: 1,
    });

    // 1. Mock select for requireAuth (admin caller)
    mockSelectChain.limit.mockResolvedValueOnce([
      {
        id: ADMIN_ID,
        email: 'admin@example.com',
        roles: ['admin'],
        authorizationVersion: 1,
        disabled: false,
      },
    ]);

    // 2. Mock select in transaction for target user
    mockSelectChain.limit.mockResolvedValueOnce([
      {
        id: TARGET_ID,
        email: 'gamer@example.com',
        roles: ['gamer'],
        authorizationVersion: 4,
        disabled: false,
      },
    ]);

    // 3. Mock returning on update returning target user profile
    mockUpdateChain.returning.mockResolvedValueOnce([
      {
        id: TARGET_ID,
        email: 'gamer@example.com',
        displayName: 'GamerOne',
        roles: ['gamer', 'creator'],
      },
    ]);

    const response = await request(app)
      .put(`/${TARGET_ID}/roles`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        roles: ['gamer', 'creator'],
      });

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      id: TARGET_ID,
      email: 'gamer@example.com',
      displayName: 'GamerOne',
      roles: ['gamer', 'creator'],
    });

    // Verify transaction DB statements
    expect(authDb.transaction).toHaveBeenCalled();
    expect(mockTx.select).toHaveBeenCalled();
    expect(mockTx.update).toHaveBeenCalled();
    expect(mockUpdateChain.set).toHaveBeenCalledWith(
      expect.objectContaining({
        roles: ['gamer', 'creator'],
        authorizationVersion: 5, // 4 + 1
      })
    );
    expect(mockTx.insert).toHaveBeenCalled(); // Audit record
  });

  it('rejects role changes from non-admins', async () => {
    const gamerToken = generateAccessToken({
      id: GAMER_ID,
      roles: ['gamer'],
      authorizationVersion: 1,
    });

    mockSelectChain.limit.mockResolvedValueOnce([
      {
        id: GAMER_ID,
        email: 'gamer@example.com',
        roles: ['gamer'],
        authorizationVersion: 1,
        disabled: false,
      },
    ]);

    const response = await request(app)
      .put(`/${TARGET_ID}/roles`)
      .set('Authorization', `Bearer ${gamerToken}`)
      .send({
        roles: ['gamer', 'creator'],
      });

    expect(response.status).toBe(403);
    expect(response.body.error.code).toBe('FORBIDDEN');
  });

  it('returns 422 for invalid roles array structure', async () => {
    const adminToken = generateAccessToken({
      id: ADMIN_ID,
      roles: ['admin'],
      authorizationVersion: 1,
    });

    mockSelectChain.limit.mockResolvedValueOnce([
      {
        id: ADMIN_ID,
        email: 'admin@example.com',
        roles: ['admin'],
        authorizationVersion: 1,
        disabled: false,
      },
    ]);

    const response = await request(app)
      .put(`/${TARGET_ID}/roles`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        roles: 'not-an-array',
      });

    expect(response.status).toBe(422);
    expect(response.body.error.code).toBe('VALIDATION_FAILED');
  });

  it('returns 422 for invalid role values in array', async () => {
    const adminToken = generateAccessToken({
      id: ADMIN_ID,
      roles: ['admin'],
      authorizationVersion: 1,
    });

    mockSelectChain.limit.mockResolvedValueOnce([
      {
        id: ADMIN_ID,
        email: 'admin@example.com',
        roles: ['admin'],
        authorizationVersion: 1,
        disabled: false,
      },
    ]);

    const response = await request(app)
      .put(`/${TARGET_ID}/roles`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        roles: ['gamer', 'hacker'], // hacker is invalid role
      });

    expect(response.status).toBe(422);
    expect(response.body.error.code).toBe('VALIDATION_FAILED');
  });

  it('returns 404 if target user is not found', async () => {
    const adminToken = generateAccessToken({
      id: ADMIN_ID,
      roles: ['admin'],
      authorizationVersion: 1,
    });

    // Mock select for requireAuth
    mockSelectChain.limit.mockResolvedValueOnce([
      {
        id: ADMIN_ID,
        email: 'admin@example.com',
        roles: ['admin'],
        authorizationVersion: 1,
        disabled: false,
      },
    ]);

    // Mock select in transaction (returns empty - user not found)
    mockSelectChain.limit.mockResolvedValueOnce([]);

    const response = await request(app)
      .put(`/${NONEXISTENT_ID}/roles`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        roles: ['gamer'],
      });

    expect(response.status).toBe(404);
    expect(response.body.error.code).toBe('USER_NOT_FOUND');
  });
});
