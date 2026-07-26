import { describe, expect, it, vi, beforeEach } from 'vitest';
import request from 'supertest';
import { createAuthApp } from '../src/app.js';
import { createHash } from 'node:crypto';

// Setup Mock chains
const mockSelectChain = {
  from: vi.fn().mockReturnThis(),
  innerJoin: vi.fn().mockReturnThis(),
  where: vi.fn().mockReturnThis(),
  limit: vi.fn(),
};

const mockInsertChain = {
  values: vi.fn().mockReturnThis(),
  returning: vi.fn(),
};

const mockUpdateChain = {
  set: vi.fn().mockReturnThis(),
  where: vi.fn().mockResolvedValue([]),
};

const mockTx = {
  update: vi.fn(() => mockUpdateChain),
  insert: vi.fn(() => mockInsertChain),
};

vi.mock('../src/infrastructure/db/client.js', () => {
  return {
    authDb: {
      select: vi.fn(() => mockSelectChain),
      insert: vi.fn(() => mockInsertChain),
      update: vi.fn(() => mockUpdateChain),
      transaction: vi.fn((callback) => callback(mockTx)),
    },
  };
});

import { authDb } from '../src/infrastructure/db/client.js';

describe('Refresh Token Rotation & Logout', () => {
  let app: any;

  beforeEach(() => {
    vi.clearAllMocks();
    app = createAuthApp(async () => {});
  });

  describe('POST /user/refresh', () => {
    it('successfully rotates refresh token and returns new access token', async () => {
      const rawToken = 'old-refresh-token';
      const tokenHash = createHash('sha256').update(rawToken).digest('hex');

      // 1. Mock DB select for Token and Family join
      mockSelectChain.limit.mockResolvedValueOnce([
        {
          token: {
            id: 'token-uuid-1',
            userId: 'user-uuid-123',
            familyId: 'family-uuid-1',
            tokenHash,
            used: false,
            expiresAt: new Date(Date.now() + 60000), // Active
          },
          family: {
            id: 'family-uuid-1',
            userId: 'user-uuid-123',
            revoked: false,
          },
        },
      ]);

      // 2. Mock DB select for user fetch
      mockSelectChain.limit.mockResolvedValueOnce([
        {
          id: 'user-uuid-123',
          roles: ['gamer'],
          authorizationVersion: 1,
        },
      ]);

      // 3. Make refresh request
      const response = await request(app)
        .post('/refresh')
        .set('Cookie', [`refreshToken=${rawToken}`]);

      // 4. Assertions
      expect(response.status).toBe(200);
      expect(response.body.accessToken).toBeDefined();
      expect(response.body.user).toEqual({
        id: 'user-uuid-123',
        roles: ['gamer'],
      });

      // Verify new cookie is set
      const cookies = response.headers['set-cookie'];
      expect(cookies).toBeDefined();
      expect(cookies[0]).toContain('refreshToken=');
      expect(cookies[0]).toContain('Path=/api/v1/user');

      // Verify database transactions were executed
      expect(authDb.transaction).toHaveBeenCalled();
      expect(mockTx.update).toHaveBeenCalled(); // Should mark old token as used
      expect(mockTx.insert).toHaveBeenCalled(); // Should insert new token
    });

    it('detects token reuse and revokes entire family', async () => {
      const rawToken = 'reused-refresh-token';
      const tokenHash = createHash('sha256').update(rawToken).digest('hex');

      // Mock database returning a token that is ALREADY used
      mockSelectChain.limit.mockResolvedValueOnce([
        {
          token: {
            id: 'token-uuid-1',
            userId: 'user-uuid-123',
            familyId: 'family-uuid-1',
            tokenHash,
            used: true, // Already used!
            expiresAt: new Date(Date.now() + 60000),
          },
          family: {
            id: 'family-uuid-1',
            userId: 'user-uuid-123',
            revoked: false,
          },
        },
      ]);

      const response = await request(app)
        .post('/refresh')
        .set('Cookie', [`refreshToken=${rawToken}`]);

      // Assertions
      expect(response.status).toBe(401);
      expect(response.body.error.code).toBe('UNAUTHENTICATED');
      expect(response.body.error.message).toContain('Token reuse detected');

      // Verify the entire family is updated to revoked = true
      expect(authDb.update).toHaveBeenCalled();
      expect(mockUpdateChain.set).toHaveBeenCalledWith({ revoked: true });
    });
  });

  describe('POST /user/logout', () => {
    it('successfully revokes family, increments auth version, and clears cookie', async () => {
      const rawToken = 'logout-refresh-token';
      const tokenHash = createHash('sha256').update(rawToken).digest('hex');

      // 1. Mock DB select for Token and Family join
      mockSelectChain.limit.mockResolvedValueOnce([
        {
          token: {
            id: 'token-uuid-1',
            userId: 'user-uuid-123',
            familyId: 'family-uuid-1',
            tokenHash,
          },
          family: {
            id: 'family-uuid-1',
            userId: 'user-uuid-123',
            revoked: false,
          },
        },
      ]);

      // 2. Make logout request
      const response = await request(app)
        .post('/logout')
        .set('Cookie', [`refreshToken=${rawToken}`]);

      // 3. Assertions
      expect(response.status).toBe(204);

      // Verify cookie is cleared (expiry in the past)
      const cookies = response.headers['set-cookie'];
      expect(cookies).toBeDefined();
      expect(cookies[0]).toContain('refreshToken=;');
      expect(cookies[0]).toContain('Expires=Thu, 01 Jan 1970 00:00:00 GMT');

      // Verify DB transaction executed updates
      expect(authDb.transaction).toHaveBeenCalled();
      expect(mockTx.update).toHaveBeenCalledTimes(2); // One for family, one for user authorization_version
    });
  });
});
