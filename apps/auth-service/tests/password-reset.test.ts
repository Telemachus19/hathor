import { describe, expect, it, vi, beforeEach } from 'vitest';
import request from 'supertest';
import { createAuthApp } from '../src/app.js';
import { hashPassword } from '../src/domain/password.js';

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

describe('POST /password/reset', () => {
  let app: any;

  beforeEach(() => {
    vi.clearAllMocks();
    app = createAuthApp(async () => {});
  });

  it('successfully updates user password and increments authorizationVersion', async () => {
    // 1. Mock DB select returning user
    mockSelectChain.limit.mockResolvedValueOnce([
      {
        id: 'user-uuid-123',
        email: 'gamer@example.com',
        passwordHash: 'old-hash',
        authorizationVersion: 2,
      },
    ]);

    // 2. Make reset request
    const response = await request(app)
      .post('/password/reset')
      .send({
        email: 'gamer@example.com',
        newPassword: 'BrandNewPassword123!', // Valid >= 12 chars
      });

    // 3. Assertions
    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);

    // Verify DB update checks
    expect(authDb.select).toHaveBeenCalled();
    expect(authDb.update).toHaveBeenCalled();
    expect(mockUpdateChain.set).toHaveBeenCalledWith(
      expect.objectContaining({
        authorizationVersion: 3, // Incremented from 2 to 3
      })
    );
  });

  it('returns 404 if user with email is not found', async () => {
    mockSelectChain.limit.mockResolvedValueOnce([]); // No user

    const response = await request(app)
      .post('/password/reset')
      .send({
        email: 'nobody@example.com',
        newPassword: 'BrandNewPassword123!',
      });

    expect(response.status).toBe(404);
    expect(response.body.error.code).toBe('USER_NOT_FOUND');
  });

  it('returns 422 if password is too short', async () => {
    const response = await request(app)
      .post('/password/reset')
      .send({
        email: 'gamer@example.com',
        newPassword: 'short', // invalid < 12 chars
      });

    expect(response.status).toBe(422);
    expect(response.body.error.code).toBe('VALIDATION_FAILED');
  });

  it('returns 403 if user account is disabled', async () => {
    mockSelectChain.limit.mockResolvedValueOnce([
      {
        id: 'gamer-uuid',
        email: 'gamer@example.com',
        passwordHash: 'old-hash',
        authorizationVersion: 2,
        disabled: true, // disabled user!
      },
    ]);

    const response = await request(app)
      .post('/password/reset')
      .send({
        email: 'gamer@example.com',
        newPassword: 'BrandNewPassword123!',
      });

    expect(response.status).toBe(403);
    expect(response.body.error.code).toBe('FORBIDDEN');
    expect(response.body.error.message).toContain('disabled');
  });
});
