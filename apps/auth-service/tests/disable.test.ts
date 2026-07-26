import { describe, expect, it, vi, beforeEach } from 'vitest';
import request from 'supertest';
import { createAuthApp } from '../src/app.js';
import { generateAccessToken } from '../src/domain/token.js';

const mockSelectChain = {
  from: vi.fn().mockReturnThis(),
  where: vi.fn().mockReturnThis(),
  limit: vi.fn(),
};

const mockUpdateChain = {
  set: vi.fn().mockReturnThis(),
  where: vi.fn().mockResolvedValue([]),
};

vi.mock('../src/infrastructure/db/client.js', () => {
  return {
    authDb: {
      select: vi.fn(() => mockSelectChain),
      update: vi.fn(() => mockUpdateChain),
    },
  };
});

import { authDb } from '../src/infrastructure/db/client.js';

describe('POST /:userId/disable', () => {
  let app: any;

  beforeEach(() => {
    vi.clearAllMocks();
    app = createAuthApp(async () => {});
  });

  it('allows admins to disable a user and increment their authorizationVersion', async () => {
    const adminToken = generateAccessToken({
      id: 'admin-uuid',
      roles: ['admin'],
      authorizationVersion: 1,
    });

    // 1. Mock DB select for requireAuth (admin caller)
    mockSelectChain.limit.mockResolvedValueOnce([
      {
        id: 'admin-uuid',
        email: 'admin@example.com',
        displayName: 'AdminUser',
        roles: ['admin'],
        authorizationVersion: 1,
      },
    ]);

    // 2. Mock DB select for disableAccountHandler (target user)
    mockSelectChain.limit.mockResolvedValueOnce([
      {
        id: 'target-uuid',
        email: 'gamer@example.com',
        displayName: 'GamerUser',
        roles: ['gamer'],
        authorizationVersion: 5,
      },
    ]);

    const response = await request(app)
      .post('/target-uuid/disable')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);

    expect(authDb.update).toHaveBeenCalled();
    expect(mockUpdateChain.set).toHaveBeenCalledWith(
      expect.objectContaining({
        authorizationVersion: 6, // 5 + 1
      })
    );
  });

  it('rejects disable action if requester is not an admin', async () => {
    const gamerToken = generateAccessToken({
      id: 'gamer-uuid',
      roles: ['gamer'], // Not admin
      authorizationVersion: 1,
    });

    // Mock DB select for requireAuth (gamer caller)
    mockSelectChain.limit.mockResolvedValueOnce([
      {
        id: 'gamer-uuid',
        email: 'gamer@example.com',
        displayName: 'GamerUser',
        roles: ['gamer'],
        authorizationVersion: 1,
      },
    ]);

    const response = await request(app)
      .post('/target-uuid/disable')
      .set('Authorization', `Bearer ${gamerToken}`);

    expect(response.status).toBe(403);
    expect(response.body.error.code).toBe('FORBIDDEN');
  });

  it('returns 404 if target user does not exist', async () => {
    const adminToken = generateAccessToken({
      id: 'admin-uuid',
      roles: ['admin'],
      authorizationVersion: 1,
    });

    // 1. Mock DB select for requireAuth (admin caller)
    mockSelectChain.limit.mockResolvedValueOnce([
      {
        id: 'admin-uuid',
        email: 'admin@example.com',
        displayName: 'AdminUser',
        roles: ['admin'],
        authorizationVersion: 1,
      },
    ]);

    // 2. Mock DB select for disableAccountHandler (target user not found)
    mockSelectChain.limit.mockResolvedValueOnce([]);

    const response = await request(app)
      .post('/nonexistent-uuid/disable')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(response.status).toBe(404);
    expect(response.body.error.code).toBe('USER_NOT_FOUND');
  });
});
