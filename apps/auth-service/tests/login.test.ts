import { describe, expect, it, vi, beforeEach } from 'vitest';
import request from 'supertest';
import { createAuthApp } from '../src/app.js';
import { hashPassword } from '../src/domain/password.js';

const mockSelectChain = {
  from: vi.fn().mockReturnThis(),
  where: vi.fn().mockReturnThis(),
  limit: vi.fn(),
};

const mockInsertChain = {
  values: vi.fn().mockReturnThis(),
  returning: vi.fn(),
};

const mockTx = {
  insert: vi.fn(() => mockInsertChain),
};

vi.mock('../src/infrastructure/db/client.js', () => {
  return {
    authDb: {
      select: vi.fn(() => mockSelectChain),
      insert: vi.fn(() => mockInsertChain),
      transaction: vi.fn((callback) => callback(mockTx)),
    },
  };
});

import { authDb } from '../src/infrastructure/db/client.js';

describe('POST /user/login', () => {
  let app: any;

  beforeEach(() => {
    vi.clearAllMocks();
    app = createAuthApp(async () => {});
  });

  it('successfully authenticates a user, returns access token, and sets cookie', async () => {
    const password = 'SuperSecurePassword123!';
    const passwordHash = await hashPassword(password);

    // 1. Mock DB select returning user
    mockSelectChain.limit.mockResolvedValue([
      {
        id: 'user-uuid-123',
        email: 'gamer@example.com',
        displayName: 'GamerOne',
        passwordHash,
        roles: ['gamer'],
        authorizationVersion: 1,
      },
    ]);

    // 2. Mock DB transaction inserts
    mockInsertChain.returning.mockResolvedValue([{ id: 'family-uuid' }]); // mock family insert

    // 3. Make login request
    const response = await request(app).post('/login').send({
      email: 'gamer@example.com',
      password,
    });

    // 4. Assertions
    expect(response.status).toBe(200);
    expect(response.body.accessToken).toBeDefined();
    expect(response.body.user).toEqual({
      id: 'user-uuid-123',
      email: 'gamer@example.com',
      displayName: 'GamerOne',
      roles: ['gamer'],
    });

    // Check cookie
    const cookies = response.headers['set-cookie'];
    expect(cookies).toBeDefined();
    expect(cookies[0]).toContain('refreshToken=');
    expect(cookies[0]).toContain('HttpOnly');
    expect(cookies[0]).toContain('Secure');
    expect(cookies[0]).toContain('SameSite=Lax');
    expect(cookies[0]).toContain('Path=/api/v1/user');

    // Verify DB calls
    expect(authDb.select).toHaveBeenCalled();
    expect(authDb.transaction).toHaveBeenCalled();
    expect(mockTx.insert).toHaveBeenCalled();
  });

  it('rejects wrong password with 401', async () => {
    const passwordHash = await hashPassword('CorrectPassword123!');

    mockSelectChain.limit.mockResolvedValue([
      {
        id: 'user-uuid-123',
        email: 'gamer@example.com',
        passwordHash,
      },
    ]);

    const response = await request(app).post('/login').send({
      email: 'gamer@example.com',
      password: 'WrongPassword!',
    });

    expect(response.status).toBe(401);
    expect(response.body.error.code).toBe('UNAUTHENTICATED');
  });

  it('rejects unregistered email with 401', async () => {
    mockSelectChain.limit.mockResolvedValue([]); // user not found

    const response = await request(app).post('/login').send({
      email: 'nonexistent@example.com',
      password: 'Password123!',
    });

    expect(response.status).toBe(401);
    expect(response.body.error.code).toBe('UNAUTHENTICATED');
  });

  it('rejects disabled user with 403', async () => {
    mockSelectChain.limit.mockResolvedValue([
      {
        id: 'user-uuid-123',
        email: 'gamer@example.com',
        passwordHash: 'dummy-hash',
        roles: ['gamer'],
        authorizationVersion: 1,
        disabled: true, // User is disabled!
      },
    ]);

    const response = await request(app).post('/login').send({
      email: 'gamer@example.com',
      password: 'any-password',
    });

    expect(response.status).toBe(403);
    expect(response.body.error.code).toBe('FORBIDDEN');
    expect(response.body.error.message).toContain('disabled');
  });
});
