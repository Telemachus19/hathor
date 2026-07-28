import { describe, it, expect, vi } from 'vitest';
import { ApiClient, createApiClient, GatewayApiError, type LoginRequest } from '@hathor/contracts';

describe('ApiClient & OpenAPI Generated Contract Client', () => {
  it('sends Authorization Bearer header when access token is set', async () => {
    let capturedHeaders: Headers | null = null;

    const mockFetch = vi.fn().mockImplementation(async (input: any, init?: any) => {
      if (init && init.headers && typeof init.headers.get === 'function') {
        capturedHeaders = init.headers;
      } else if (input && typeof input === 'object' && typeof input.headers?.get === 'function') {
        capturedHeaders = input.headers;
      } else if (init?.headers) {
        capturedHeaders = new Headers(init.headers);
      }

      return new Response(
        JSON.stringify({
          id: 'user-123',
          email: 'test@example.com',
          displayName: 'Test User',
          roles: ['gamer'],
        }),
        {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    });

    const client = createApiClient({
      baseUrl: 'http://localhost:5000/api/v1',
      fetch: mockFetch as unknown as typeof fetch,
    });

    client.setAccessToken('my-secret-jwt-token');

    await client.GET('/user/me');

    expect(mockFetch).toHaveBeenCalled();
    expect(capturedHeaders).not.toBeNull();
    expect(capturedHeaders?.get('Authorization')).toBe('Bearer my-secret-jwt-token');
  });

  it('automatically attaches Anti-CSRF headers (X-Requested-With & X-Hathor-CSRF) on mutating requests', async () => {
    let capturedHeaders: Headers | null = null;

    const mockFetch = vi.fn().mockImplementation(async (input: any, init?: any) => {
      if (init && init.headers && typeof init.headers.get === 'function') {
        capturedHeaders = init.headers;
      } else if (input && typeof input === 'object' && typeof input.headers?.get === 'function') {
        capturedHeaders = input.headers;
      } else if (init?.headers) {
        capturedHeaders = new Headers(init.headers);
      }

      return new Response(
        JSON.stringify({
          accessToken: 'new-token',
          user: { id: 'u1', email: 'a@b.com', displayName: 'User', roles: ['gamer'] },
        }),
        {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    });

    const client = createApiClient({
      baseUrl: 'http://localhost:5000/api/v1',
      csrfToken: 'test-csrf-token',
      fetch: mockFetch as unknown as typeof fetch,
    });

    await client.POST('/user/login', {
      body: { email: 'test@example.com', password: 'password123' },
    });

    expect(capturedHeaders).not.toBeNull();
    expect(capturedHeaders?.get('X-Requested-With')).toBe('XMLHttpRequest');
    expect(capturedHeaders?.get('X-Hathor-CSRF')).toBe('1');
    expect(capturedHeaders?.get('X-CSRF-Token')).toBe('test-csrf-token');
  });

  it('correctly passes typed request body for login and parses error responses into GatewayApiError', async () => {
    const mockFetch = vi.fn().mockImplementation(async () => {
      return new Response(
        JSON.stringify({
          error: {
            code: 'INVALID_CREDENTIALS',
            message: 'Invalid email address or password',
            correlationId: 'test-corr-id',
          },
        }),
        {
          status: 401,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    });

    const client = new ApiClient({
      baseUrl: 'http://localhost:5000/api/v1',
      fetch: mockFetch as unknown as typeof fetch,
    });

    const loginPayload: LoginRequest = {
      email: 'user@example.com',
      password: 'MyPassword123!',
    };

    await expect(
      client.POST('/user/login', {
        body: loginPayload,
      })
    ).rejects.toThrow(GatewayApiError);
  });
});
