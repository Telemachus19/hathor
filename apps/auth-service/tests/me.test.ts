import { describe, expect, it, vi, beforeEach } from 'vitest';
import request from 'supertest';
import { createAuthApp } from '../src/app.js';
import { generateAccessToken } from '../src/domain/token.js';

const mockSelectChain = {
  from: vi.fn().mockReturnThis(),
  where: vi.fn().mockReturnThis(),
  limit: vi.fn(),
};

vi.mock('../src/infrastructure/db/client.js', () => {
  return {
    authDb: {
      select: vi.fn(() => mockSelectChain),
    },
  };
});

import { authDb } from '../src/infrastructure/db/client.js';

describe('GET /user/me', () => {
  let app: any;

  beforeEach(() => {
    vi.clearAllMocks();
    app = createAuthApp(async () => {});
  });

  it('successfully retrieves current user profile with valid access token', async () => {
    const userPayload = {
      id: 'user-uuid-123',
      roles: ['gamer'],
      authorizationVersion: 1,
    };

    // 1. Generate a valid token
    const token = generateAccessToken(userPayload);

    // 2. Mock DB check for user
    mockSelectChain.limit.mockResolvedValueOnce([
      {
        id: 'user-uuid-123',
        email: 'gamer@example.com',
        displayName: 'GamerOne',
        roles: ['gamer'],
        authorizationVersion: 1, // Matches token version
      },
    ]);

    // 3. Make request
    const response = await request(app)
      .get('/me')
      .set('Authorization', `Bearer ${token}`);

    // 4. Assertions
    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      id: 'user-uuid-123',
      email: 'gamer@example.com',
      displayName: 'GamerOne',
      roles: ['gamer'],
    });

    expect(authDb.select).toHaveBeenCalled();
  });

  it('rejects with 401 when Authorization header is missing', async () => {
    const response = await request(app).get('/me');

    expect(response.status).toBe(401);
    expect(response.body.error.code).toBe('UNAUTHENTICATED');
    expect(response.body.error.message).toContain('Missing or invalid Authorization header');
  });

  it('rejects with 401 when token authorization version is outdated', async () => {
    const userPayload = {
      id: 'user-uuid-123',
      roles: ['gamer'],
      authorizationVersion: 1, // Token version = 1
    };

    const token = generateAccessToken(userPayload);

    // Mock DB user having a higher version (e.g. version 2 due to logout/reset)
    mockSelectChain.limit.mockResolvedValueOnce([
      {
        id: 'user-uuid-123',
        email: 'gamer@example.com',
        displayName: 'GamerOne',
        roles: ['gamer'],
        authorizationVersion: 2, // Database version = 2
      },
    ]);

    const response = await request(app)
      .get('/me')
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(401);
    expect(response.body.error.code).toBe('UNAUTHENTICATED');
    expect(response.body.error.message).toContain('Token has been invalidated');
  });

  it('rejects with 401 for an invalid token signature', async () => {
    const response = await request(app)
      .get('/me')
      .set('Authorization', 'Bearer invalid-token-string');

    expect(response.status).toBe(401);
    expect(response.body.error.code).toBe('UNAUTHENTICATED');
  });

  it('rejects with 401 if user is disabled', async () => {
    const userPayload = {
      id: 'user-uuid-123',
      roles: ['gamer'],
      authorizationVersion: 1,
    };

    const token = generateAccessToken(userPayload);

    // Mock DB select returning user with disabled: true
    mockSelectChain.limit.mockResolvedValueOnce([
      {
        id: 'user-uuid-123',
        email: 'gamer@example.com',
        displayName: 'GamerOne',
        roles: ['gamer'],
        authorizationVersion: 1,
        disabled: true, // disabled user!
      },
    ]);

    const response = await request(app)
      .get('/me')
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(401);
    expect(response.body.error.code).toBe('UNAUTHENTICATED');
    expect(response.body.error.message).toContain('disabled');
  });
});
