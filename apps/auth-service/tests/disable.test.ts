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

// Real UUIDs for tests
const ADMIN_ID = 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11';
const GAMER_ID = 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22';
const TARGET_ID = '14ab3487-6415-4054-a491-df3acd7a15bf';
const NONEXISTENT_ID = '24ab3487-6415-4054-a491-df3acd7a15bf';

describe('POST /:userId/disable', () => {
  let app: any;

  beforeEach(() => {
    vi.clearAllMocks();
    app = createAuthApp(async () => {});
  });

  it('allows admins to disable a user and increment their authorizationVersion', async () => {
    const adminToken = generateAccessToken({
      id: ADMIN_ID,
      roles: ['admin'],
      authorizationVersion: 1,
    });

    // 1. Mock DB select for requireAuth (admin caller)
    mockSelectChain.limit.mockResolvedValueOnce([
      {
        id: ADMIN_ID,
        email: 'admin@example.com',
        displayName: 'AdminUser',
        roles: ['admin'],
        authorizationVersion: 1,
        disabled: false,
      },
    ]);

    // 2. Mock DB select for disableAccountHandler (target user)
    mockSelectChain.limit.mockResolvedValueOnce([
      {
        id: TARGET_ID,
        email: 'gamer@example.com',
        displayName: 'GamerUser',
        roles: ['gamer'],
        authorizationVersion: 5,
        disabled: false,
      },
    ]);

    const response = await request(app)
      .post(`/${TARGET_ID}/disable`)
      .set('Authorization', `Bearer ${adminToken}`);

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);

    expect(authDb.update).toHaveBeenCalled();
    expect(mockUpdateChain.set).toHaveBeenCalledWith(
      expect.objectContaining({
        disabled: true,
        authorizationVersion: 6, // 5 + 1
      })
    );
  });

  it('rejects disable action if requester is not an admin', async () => {
    const gamerToken = generateAccessToken({
      id: GAMER_ID,
      roles: ['gamer'], // Not admin
      authorizationVersion: 1,
    });

    // Mock DB select for requireAuth (gamer caller)
    mockSelectChain.limit.mockResolvedValueOnce([
      {
        id: GAMER_ID,
        email: 'gamer@example.com',
        displayName: 'GamerUser',
        roles: ['gamer'],
        authorizationVersion: 1,
        disabled: false,
      },
    ]);

    const response = await request(app)
      .post(`/${TARGET_ID}/disable`)
      .set('Authorization', `Bearer ${gamerToken}`);

    expect(response.status).toBe(403);
    expect(response.body.error.code).toBe('FORBIDDEN');
  });

  it('returns 404 if target user does not exist', async () => {
    const adminToken = generateAccessToken({
      id: ADMIN_ID,
      roles: ['admin'],
      authorizationVersion: 1,
    });

    // 1. Mock DB select for requireAuth (admin caller)
    mockSelectChain.limit.mockResolvedValueOnce([
      {
        id: ADMIN_ID,
        email: 'admin@example.com',
        displayName: 'AdminUser',
        roles: ['admin'],
        authorizationVersion: 1,
        disabled: false,
      },
    ]);

    // 2. Mock DB select for disableAccountHandler (target user not found)
    mockSelectChain.limit.mockResolvedValueOnce([]);

    const response = await request(app)
      .post(`/${NONEXISTENT_ID}/disable`)
      .set('Authorization', `Bearer ${adminToken}`);

    expect(response.status).toBe(404);
    expect(response.body.error.code).toBe('USER_NOT_FOUND');
  });

  it('returns 422 if userId path parameter is not a valid UUID', async () => {
    const adminToken = generateAccessToken({
      id: ADMIN_ID,
      roles: ['admin'],
      authorizationVersion: 1,
    });

    // Mock DB select for requireAuth (admin caller)
    mockSelectChain.limit.mockResolvedValueOnce([
      {
        id: ADMIN_ID,
        email: 'admin@example.com',
        displayName: 'AdminUser',
        roles: ['admin'],
        authorizationVersion: 1,
        disabled: false,
      },
    ]);

    const response = await request(app)
      .post('/invalid-uuid-string/disable')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(response.status).toBe(422);
    expect(response.body.error.code).toBe('VALIDATION_FAILED');
  });
});

describe('POST /:userId/enable', () => {
  let app: any;

  beforeEach(() => {
    vi.clearAllMocks();
    app = createAuthApp(async () => {});
  });

  it('allows admins to enable a user and increment their authorizationVersion', async () => {
    const adminToken = generateAccessToken({
      id: ADMIN_ID,
      roles: ['admin'],
      authorizationVersion: 1,
    });

    // 1. Mock DB select for requireAuth (admin caller)
    mockSelectChain.limit.mockResolvedValueOnce([
      {
        id: ADMIN_ID,
        email: 'admin@example.com',
        displayName: 'AdminUser',
        roles: ['admin'],
        authorizationVersion: 1,
        disabled: false,
      },
    ]);

    // 2. Mock DB select for enableAccountHandler (target user)
    mockSelectChain.limit.mockResolvedValueOnce([
      {
        id: TARGET_ID,
        email: 'gamer@example.com',
        displayName: 'GamerUser',
        roles: ['gamer'],
        authorizationVersion: 5,
        disabled: true, // disabled originally
      },
    ]);

    const response = await request(app)
      .post(`/${TARGET_ID}/enable`)
      .set('Authorization', `Bearer ${adminToken}`);

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);

    expect(authDb.update).toHaveBeenCalled();
    expect(mockUpdateChain.set).toHaveBeenCalledWith(
      expect.objectContaining({
        disabled: false,
        authorizationVersion: 6, // 5 + 1
      })
    );
  });

  it('rejects enable action if requester is not an admin', async () => {
    const gamerToken = generateAccessToken({
      id: GAMER_ID,
      roles: ['gamer'],
      authorizationVersion: 1,
    });

    // Mock DB select for requireAuth (gamer caller)
    mockSelectChain.limit.mockResolvedValueOnce([
      {
        id: GAMER_ID,
        email: 'gamer@example.com',
        displayName: 'GamerUser',
        roles: ['gamer'],
        authorizationVersion: 1,
        disabled: false,
      },
    ]);

    const response = await request(app)
      .post(`/${TARGET_ID}/enable`)
      .set('Authorization', `Bearer ${gamerToken}`);

    expect(response.status).toBe(403);
    expect(response.body.error.code).toBe('FORBIDDEN');
  });

  it('returns 404 if target user does not exist', async () => {
    const adminToken = generateAccessToken({
      id: ADMIN_ID,
      roles: ['admin'],
      authorizationVersion: 1,
    });

    // 1. Mock DB select for requireAuth (admin caller)
    mockSelectChain.limit.mockResolvedValueOnce([
      {
        id: ADMIN_ID,
        email: 'admin@example.com',
        displayName: 'AdminUser',
        roles: ['admin'],
        authorizationVersion: 1,
        disabled: false,
      },
    ]);

    // 2. Mock DB select for enableAccountHandler (target user not found)
    mockSelectChain.limit.mockResolvedValueOnce([]);

    const response = await request(app)
      .post(`/${NONEXISTENT_ID}/enable`)
      .set('Authorization', `Bearer ${adminToken}`);

    expect(response.status).toBe(404);
    expect(response.body.error.code).toBe('USER_NOT_FOUND');
  });

  it('returns 422 if userId path parameter is not a valid UUID', async () => {
    const adminToken = generateAccessToken({
      id: ADMIN_ID,
      roles: ['admin'],
      authorizationVersion: 1,
    });

    // Mock DB select for requireAuth (admin caller)
    mockSelectChain.limit.mockResolvedValueOnce([
      {
        id: ADMIN_ID,
        email: 'admin@example.com',
        displayName: 'AdminUser',
        roles: ['admin'],
        authorizationVersion: 1,
        disabled: false,
      },
    ]);

    const response = await request(app)
      .post('/invalid-uuid-string/enable')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(response.status).toBe(422);
    expect(response.body.error.code).toBe('VALIDATION_FAILED');
  });
});
