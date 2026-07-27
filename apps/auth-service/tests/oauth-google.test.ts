import { describe, expect, it, vi, beforeEach } from 'vitest';
import request from 'supertest';
import { createAuthApp } from '../src/app.js';

const mockSelectChain = {
  from: vi.fn().mockReturnThis(),
  where: vi.fn().mockReturnThis(),
  limit: vi.fn(),
};

const mockInsertChain = {
  values: vi.fn().mockReturnThis(),
  returning: vi.fn().mockResolvedValue([{ id: 'new-user-id' }]),
};

const mockTransaction = vi.fn(async (callback) => {
  const tx = {
    insert: vi.fn(() => mockInsertChain),
  };
  return callback(tx);
});

vi.mock('../src/infrastructure/db/client.js', () => {
  return {
    authDb: {
      select: vi.fn(() => mockSelectChain),
      insert: vi.fn(() => mockInsertChain),
      transaction: (cb: any) => mockTransaction(cb),
    },
  };
});

describe('Google OAuth 2.0 Endpoints', () => {
  let app: any;

  beforeEach(() => {
    vi.clearAllMocks();
    process.env.GOOGLE_CLIENT_ID = 'test-google-client-id';
    process.env.GOOGLE_CLIENT_SECRET = 'test-google-client-secret';
    process.env.FRONTEND_URL = 'http://localhost:3000';
    app = createAuthApp(async () => {});
  });

  describe('GET /oauth/google', () => {
    it('sets oauth_state cookie and redirects to Google accounts consent URL', async () => {
      const response = await request(app).get('/oauth/google');

      expect(response.status).toBe(302);
      expect(response.headers['location']).toContain('accounts.google.com/o/oauth2/v2/auth');
      expect(response.headers['location']).toContain('test-google-client-id');
      expect(response.headers['set-cookie']).toBeDefined();
      expect(response.headers['set-cookie'][0]).toContain('oauth_state=');
    });

    it('returns 503 if GOOGLE_CLIENT_ID is not configured', async () => {
      delete process.env.GOOGLE_CLIENT_ID;
      const response = await request(app).get('/oauth/google');

      expect(response.status).toBe(503);
      expect(response.body.error.code).toBe('OAUTH_NOT_CONFIGURED');
    });
  });

  describe('GET /oauth/google/callback', () => {
    it('redirects to frontend login with error if state cookie is missing or invalid', async () => {
      const response = await request(app)
        .get('/oauth/google/callback?code=test-code&state=invalid-state')
        .set('Cookie', ['oauth_state=different-state']);

      expect(response.status).toBe(302);
      expect(response.headers['location']).toContain('/login?error=OAUTH_STATE_INVALID');
    });

    it('redirects to frontend login with error if user cancelled Google login', async () => {
      const response = await request(app).get('/oauth/google/callback?error=access_denied');

      expect(response.status).toBe(302);
      expect(response.headers['location']).toContain('/login?error=OAUTH_CANCELLED');
    });
  });
});
