import { describe, it, expect, vi } from 'vitest';
import {
  ApiClient,
  createApiClient,
  GatewayApiError,
  type LoginRequest,
  type RegisterRequest,
} from '@hathor/contracts';

function extractHeaders(input: any, init?: any): Headers {
  if (input instanceof Request) {
    return input.headers;
  }
  if (init?.headers) {
    if (init.headers instanceof Headers) {
      return init.headers;
    }
    return new Headers(init.headers);
  }
  return new Headers();
}

describe('ApiClient & OpenAPI Generated Contract Client', () => {
  describe('1. Anti-CSRF & Origin Protection Headers', () => {
    it('automatically attaches Anti-CSRF headers (X-Requested-With & X-Hathor-CSRF) on mutating requests (POST, PUT, DELETE, PATCH)', async () => {
      let capturedHeaders: Headers | null = null;

      const mockFetch = vi.fn().mockImplementation(async (input: any, init?: any) => {
        capturedHeaders = extractHeaders(input, init);
        return new Response(
          JSON.stringify({
            accessToken: 'test-jwt',
            user: { id: 'u1', email: 'test@hathor.dev', displayName: 'Gamer', roles: ['gamer'] },
          }),
          { status: 200, headers: { 'Content-Type': 'application/json' } }
        );
      });

      const client = createApiClient({
        baseUrl: 'http://localhost:5000/api/v1',
        csrfToken: 'csrf-secret-123',
        fetch: mockFetch as unknown as typeof fetch,
      });

      await client.POST('/user/login', {
        body: { email: 'gamer@hathor.dev', password: 'Password123!' },
      });

      expect(capturedHeaders).not.toBeNull();
      expect(capturedHeaders?.get('X-Requested-With')).toBe('XMLHttpRequest');
      expect(capturedHeaders?.get('X-Hathor-CSRF')).toBe('1');
      expect(capturedHeaders?.get('X-CSRF-Token')).toBe('csrf-secret-123');
    });

    it('does NOT attach Anti-CSRF headers on non-mutating requests (GET)', async () => {
      let capturedHeaders: Headers | null = null;

      const mockFetch = vi.fn().mockImplementation(async (input: any, init?: any) => {
        capturedHeaders = extractHeaders(input, init);
        return new Response(
          JSON.stringify({
            items: [],
            pagination: { page: 1, limit: 10, totalItems: 0, totalPages: 0 },
          }),
          { status: 200, headers: { 'Content-Type': 'application/json' } }
        );
      });

      const client = createApiClient({
        baseUrl: 'http://localhost:5000/api/v1',
        fetch: mockFetch as unknown as typeof fetch,
      });

      await client.GET('/store/games');

      expect(capturedHeaders).not.toBeNull();
      expect(capturedHeaders?.get('X-Requested-With')).toBeFalsy();
      expect(capturedHeaders?.get('X-Hathor-CSRF')).toBeFalsy();
    });

    it('resolves CSRF token dynamically from async getCsrfToken getter', async () => {
      let capturedHeaders: Headers | null = null;

      const mockFetch = vi.fn().mockImplementation(async (input: any, init?: any) => {
        capturedHeaders = extractHeaders(input, init);
        return new Response(JSON.stringify({ success: true }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        });
      });

      const client = createApiClient({
        baseUrl: 'http://localhost:5000/api/v1',
        getCsrfToken: async () => 'dynamic-csrf-999',
        fetch: mockFetch as unknown as typeof fetch,
      });

      await client.POST('/user/logout');

      expect(capturedHeaders?.get('X-CSRF-Token')).toBe('dynamic-csrf-999');
    });

    it('allows explicitly disabling Anti-CSRF headers via config', async () => {
      let capturedHeaders: Headers | null = null;

      const mockFetch = vi.fn().mockImplementation(async (input: any, init?: any) => {
        capturedHeaders = extractHeaders(input, init);
        return new Response(JSON.stringify({ success: true }), { status: 200 });
      });

      const client = createApiClient({
        baseUrl: 'http://localhost:5000/api/v1',
        enableAntiCsrfHeader: false,
        fetch: mockFetch as unknown as typeof fetch,
      });

      await client.POST('/user/logout');

      expect(capturedHeaders?.get('X-Requested-With')).toBeFalsy();
      expect(capturedHeaders?.get('X-Hathor-CSRF')).toBeFalsy();
    });
  });

  describe('2. Authorization Bearer Header Transmission', () => {
    it('transmits Authorization Bearer header when access token is set via setAccessToken', async () => {
      let capturedHeaders: Headers | null = null;

      const mockFetch = vi.fn().mockImplementation(async (input: any, init?: any) => {
        capturedHeaders = extractHeaders(input, init);
        return new Response(
          JSON.stringify({ id: 'u-1', email: 'test@hathor.dev', displayName: 'User', roles: ['gamer'] }),
          { status: 200, headers: { 'Content-Type': 'application/json' } }
        );
      });

      const client = createApiClient({
        baseUrl: 'http://localhost:5000/api/v1',
        fetch: mockFetch as unknown as typeof fetch,
      });

      client.setAccessToken('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.test-jwt');

      await client.GET('/user/me');

      expect(capturedHeaders?.get('Authorization')).toBe(
        'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.test-jwt'
      );
    });

    it('dynamically retrieves access token via async getAccessToken function', async () => {
      let capturedHeaders: Headers | null = null;

      const mockFetch = vi.fn().mockImplementation(async (input: any, init?: any) => {
        capturedHeaders = extractHeaders(input, init);
        return new Response(
          JSON.stringify({ id: 'u-1', email: 'test@hathor.dev', displayName: 'User', roles: ['gamer'] }),
          { status: 200, headers: { 'Content-Type': 'application/json' } }
        );
      });

      const client = createApiClient({
        baseUrl: 'http://localhost:5000/api/v1',
        getAccessToken: async () => 'async-retrieved-jwt-token',
        fetch: mockFetch as unknown as typeof fetch,
      });

      await client.GET('/user/me');

      expect(capturedHeaders?.get('Authorization')).toBe('Bearer async-retrieved-jwt-token');
    });

    it('omits Authorization header when no access token is set', async () => {
      let capturedHeaders: Headers | null = null;

      const mockFetch = vi.fn().mockImplementation(async (input: any, init?: any) => {
        capturedHeaders = extractHeaders(input, init);
        return new Response(
          JSON.stringify({ items: [], pagination: { page: 1, limit: 10, totalItems: 0, totalPages: 0 } }),
          { status: 200, headers: { 'Content-Type': 'application/json' } }
        );
      });

      const client = createApiClient({
        baseUrl: 'http://localhost:5000/api/v1',
        fetch: mockFetch as unknown as typeof fetch,
      });

      await client.GET('/store/games');

      expect(capturedHeaders?.get('Authorization')).toBeFalsy();
    });
  });

  describe('3. OpenAPI Generated Contract Client & Typed Validation', () => {
    it('instantiates ApiClient directly or via factory function createApiClient', () => {
      const client1 = new ApiClient({ baseUrl: 'http://localhost:5000/api/v1' });
      const client2 = createApiClient({ baseUrl: 'http://localhost:5000/api/v1' });

      expect(client1).toBeInstanceOf(ApiClient);
      expect(client2).toBeInstanceOf(ApiClient);
    });

    it('type-checks request payload against OpenAPI contract schemas (LoginRequest & RegisterRequest)', async () => {
      let capturedBody: any = null;

      const mockFetch = vi.fn().mockImplementation(async (input: any, init?: any) => {
        if (input instanceof Request) {
          capturedBody = await input.json();
        } else if (init?.body) {
          capturedBody = JSON.parse(init.body);
        }
        return new Response(
          JSON.stringify({
            accessToken: 'token-123',
            user: { id: 'u1', email: 'reg@hathor.dev', displayName: 'New User', roles: ['gamer'] },
          }),
          { status: 201, headers: { 'Content-Type': 'application/json' } }
        );
      });

      const client = createApiClient({
        baseUrl: 'http://localhost:5000/api/v1',
        fetch: mockFetch as unknown as typeof fetch,
      });

      const registerPayload: RegisterRequest = {
        email: 'reg@hathor.dev',
        password: 'SecurePassword123!',
        displayName: 'New Gamer',
      };

      await client.POST('/user/register', {
        body: registerPayload,
      });

      expect(capturedBody).toEqual(registerPayload);
    });

    it('parses error responses into GatewayApiError with code, message, status, correlationId, and field details', async () => {
      const mockFetch = vi.fn().mockImplementation(async () => {
        return new Response(
          JSON.stringify({
            error: {
              code: 'VALIDATION_ERROR',
              message: 'Invalid input parameters',
              correlationId: 'corr-id-abc-123',
              details: [
                { field: 'email', message: 'Email must be a valid email address' },
                { field: 'password', message: 'Password is too short' },
              ],
            },
          }),
          {
            status: 400,
            headers: { 'Content-Type': 'application/json' },
          }
        );
      });

      const client = new ApiClient({
        baseUrl: 'http://localhost:5000/api/v1',
        fetch: mockFetch as unknown as typeof fetch,
      });

      const loginPayload: LoginRequest = {
        email: 'invalid-email',
        password: 'short',
      };

      try {
        await client.POST('/user/login', {
          body: loginPayload,
        });
        expect.fail('Should have thrown GatewayApiError');
      } catch (err: any) {
        expect(err).toBeInstanceOf(GatewayApiError);
        expect(err.code).toBe('VALIDATION_ERROR');
        expect(err.status).toBe(400);
        expect(err.correlationId).toBe('corr-id-abc-123');
        expect(err.details).toEqual({
          email: 'Email must be a valid email address',
          password: 'Password is too short',
        });
      }
    });
  });
});
