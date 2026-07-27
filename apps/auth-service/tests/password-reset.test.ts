import { describe, expect, it, vi, beforeEach } from 'vitest';
import request from 'supertest';
import { createAuthApp } from '../src/app.js';

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
  where: vi.fn().mockResolvedValue([]),
};

const mockTransaction = vi.fn(async (callback) => {
  const tx = {
    update: vi.fn(() => mockUpdateChain),
  };
  return callback(tx);
});

vi.mock('../src/infrastructure/db/client.js', () => {
  return {
    authDb: {
      select: vi.fn(() => mockSelectChain),
      insert: vi.fn(() => mockInsertChain),
      update: vi.fn(() => mockUpdateChain),
      transaction: (cb: any) => mockTransaction(cb),
    },
  };
});

import { authDb } from '../src/infrastructure/db/client.js';

describe('Password Reset Endpoints', () => {
  let app: any;

  beforeEach(() => {
    vi.clearAllMocks();
    app = createAuthApp(async () => {});
  });

  describe('POST /password/forgot', () => {
    it('returns generic success message for valid email and creates reset token hash', async () => {
      mockSelectChain.limit.mockResolvedValueOnce([
        {
          id: 'user-uuid-123',
          email: 'gamer@example.com',
          displayName: 'GamerOne',
          disabled: false,
        },
      ]);

      const response = await request(app).post('/password/forgot').send({
        email: 'gamer@example.com',
      });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toContain('reset link has been sent');
      expect(authDb.insert).toHaveBeenCalled();
    });

    it('returns generic success message for unknown email without creating token (anti-enumeration)', async () => {
      mockSelectChain.limit.mockResolvedValueOnce([]); // No user found

      const response = await request(app).post('/password/forgot').send({
        email: 'unknown@example.com',
      });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toContain('reset link has been sent');
    });

    it('returns 422 for malformed email format', async () => {
      const response = await request(app).post('/password/forgot').send({
        email: 'invalid-email',
      });

      expect(response.status).toBe(422);
      expect(response.body.error.code).toBe('VALIDATION_FAILED');
    });
  });

  describe('POST /password/reset', () => {
    it('successfully resets password using token and increments authorizationVersion', async () => {
      // 1. Mock reset token lookup
      mockSelectChain.limit
        .mockResolvedValueOnce([
          {
            id: 'token-uuid-1',
            userId: 'user-uuid-123',
            used: false,
            expiresAt: new Date(Date.now() + 100000),
          },
        ])
        // 2. Mock user lookup
        .mockResolvedValueOnce([
          {
            id: 'user-uuid-123',
            email: 'gamer@example.com',
            authorizationVersion: 5,
            disabled: false,
          },
        ]);

      const response = await request(app).post('/password/reset').send({
        token: 'valid-32-byte-hex-token-string',
        newPassword: 'BrandNewPassword123!',
      });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(mockTransaction).toHaveBeenCalled();
    });

    it('returns 400 when reset token is invalid, expired, or already used', async () => {
      mockSelectChain.limit.mockResolvedValueOnce([]); // Token not found or used

      const response = await request(app).post('/password/reset').send({
        token: 'expired-or-used-token',
        newPassword: 'BrandNewPassword123!',
      });

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe('INVALID_RESET_TOKEN');
    });

    it('returns 422 if new password is too short (< 12 chars)', async () => {
      const response = await request(app).post('/password/reset').send({
        token: 'valid-token',
        newPassword: 'short',
      });

      expect(response.status).toBe(422);
      expect(response.body.error.code).toBe('VALIDATION_FAILED');
    });
  });
});
