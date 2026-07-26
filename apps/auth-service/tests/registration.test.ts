import { describe, expect, it, vi, beforeEach } from 'vitest';
import request from 'supertest';
import { createAuthApp } from '../src/app.js';
import { FakeTurnstileVerifier } from '../src/infrastructure/turnstile/fake.js';

// Define the mock chains for Drizzle ORM
const mockSelectChain = {
  from: vi.fn().mockReturnThis(),
  where: vi.fn().mockReturnThis(),
  limit: vi.fn(),
};

const mockInsertChain = {
  values: vi.fn().mockReturnThis(),
  returning: vi.fn(),
};

// Mock the DB client module before importing
vi.mock('../src/infrastructure/db/client.js', () => {
  return {
    authDb: {
      select: vi.fn(() => mockSelectChain),
      insert: vi.fn(() => mockInsertChain),
    },
  };
});

// Import authDb to control mocked return values
import { authDb } from '../src/infrastructure/db/client.js';

describe('POST /user/register', () => {
  let app: any;
  let fakeVerifier: FakeTurnstileVerifier;

  beforeEach(() => {
    vi.clearAllMocks();
    fakeVerifier = new FakeTurnstileVerifier(true);
    app = createAuthApp(async () => {}, fakeVerifier);
  });

  it('successfully registers a user with gamer role and hashes password', async () => {
    // 1. Setup DB Mock behavior
    mockSelectChain.limit.mockResolvedValue([]); // No existing user
    mockInsertChain.returning.mockResolvedValue([
      {
        id: 'user-uuid-123',
        email: 'gamer@example.com',
        displayName: 'GamerOne',
        roles: ['gamer'],
      },
    ]);

    // 2. Send registration request
    const response = await request(app)
      .post('/user/register')
      .send({
        email: 'gamer@example.com',
        password: 'SuperSecurePassword123!',
        displayName: 'GamerOne',
        captchaToken: 'valid-captcha-token',
      });

    // 3. Assertions
    expect(response.status).toBe(201);
    expect(response.body).toEqual({
      id: 'user-uuid-123',
      email: 'gamer@example.com',
      displayName: 'GamerOne',
      roles: ['gamer'],
    });

    // Verify insert had the gamer role forced
    expect(authDb.insert).toHaveBeenCalled();
    expect(mockInsertChain.values).toHaveBeenCalledWith(
      expect.objectContaining({
        email: 'gamer@example.com',
        displayName: 'GamerOne',
        roles: ['gamer'], // Ensures roles: ['gamer'] is forced
      })
    );
  });

  it('rejects registration with 422 if Turnstile validation fails', async () => {
    const response = await request(app)
      .post('/user/register')
      .send({
        email: 'gamer@example.com',
        password: 'SuperSecurePassword123!',
        displayName: 'GamerOne',
        captchaToken: 'fail-token', // Triggers fake Turnstile failure
      });

    expect(response.status).toBe(422);
    expect(response.body.error.code).toBe('VALIDATION_FAILED');
    expect(response.body.error.message).toContain('Invalid CAPTCHA token');
  });

  it('rejects registration with 422 if input validation fails (e.g. password too short)', async () => {
    const response = await request(app)
      .post('/user/register')
      .send({
        email: 'gamer@example.com',
        password: 'short', // Too short (min 12 chars required)
        displayName: 'GamerOne',
        captchaToken: 'valid-captcha-token',
      });

    expect(response.status).toBe(422);
    expect(response.body.error.code).toBe('VALIDATION_FAILED');
    expect(response.body.error.message).toContain('Invalid registration request inputs');
  });

  it('rejects registration with 409 if email already exists', async () => {
    // Mock user already existing
    mockSelectChain.limit.mockResolvedValue([
      { id: 'existing-id', email: 'gamer@example.com' },
    ]);

    const response = await request(app)
      .post('/user/register')
      .send({
        email: 'gamer@example.com',
        password: 'SuperSecurePassword123!',
        displayName: 'GamerOne',
        captchaToken: 'valid-captcha-token',
      });

    expect(response.status).toBe(409);
    expect(response.body.error.code).toBe('EMAIL_ALREADY_EXISTS');
  });
});
