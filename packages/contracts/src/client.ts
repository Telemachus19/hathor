import createClient, { type ClientOptions } from 'openapi-fetch';
import type { paths } from './generated/openapi.js';
import type { ApiErrorDetail } from './http.js';

export type ApiClientConfig = {
  baseUrl: string;
  accessToken?: string | null;
  getAccessToken?: () => string | null | Promise<string | null>;
  csrfToken?: string | null;
  getCsrfToken?: () => string | null | Promise<string | null>;
  enableAntiCsrfHeader?: boolean;
  fetch?: typeof fetch;
};

export class GatewayApiError extends Error {
  public readonly code: string;
  public readonly correlationId?: string;
  public readonly details?: Record<string, string | string[]>;
  public readonly status: number;

  constructor(
    code: string,
    message: string,
    status: number,
    correlationId?: string,
    details?: Record<string, string | string[]>
  ) {
    super(message);
    this.name = 'GatewayApiError';
    this.code = code;
    this.status = status;
    this.correlationId = correlationId;
    this.details = details;
  }
}

export class ApiClient {
  private accessToken: string | null = null;
  private csrfToken: string | null = null;
  private readonly getAccessTokenFn?: () => string | null | Promise<string | null>;
  private readonly getCsrfTokenFn?: () => string | null | Promise<string | null>;
  private readonly enableAntiCsrfHeader: boolean;
  public readonly fetchClient: ReturnType<typeof createClient<paths>>;

  constructor(config: ApiClientConfig) {
    this.accessToken = config.accessToken ?? null;
    this.csrfToken = config.csrfToken ?? null;
    this.getAccessTokenFn = config.getAccessToken;
    this.getCsrfTokenFn = config.getCsrfToken;
    this.enableAntiCsrfHeader = config.enableAntiCsrfHeader ?? true;

    const options: ClientOptions = {
      baseUrl: config.baseUrl,
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
    };

    if (config.fetch) {
      options.fetch = config.fetch;
    }

    this.fetchClient = createClient<paths>(options);

    // Middleware to attach Authorization Bearer header, Anti-CSRF headers, and handle errors
    this.fetchClient.use({
      onRequest: async ({ request, options }) => {
        const method = ((options as any)?.method || request.method || 'GET').toUpperCase();
        const isMutatingMethod = ['POST', 'PUT', 'DELETE', 'PATCH'].includes(method);

        // Attach Authorization Bearer header if access token exists
        let token = this.accessToken;
        if (!token && this.getAccessTokenFn) {
          token = await this.getAccessTokenFn();
        }
        if (token) {
          request.headers.set('Authorization', `Bearer ${token}`);
        }

        // Automatically add Anti-CSRF headers only for mutating HTTP methods (POST, PUT, PATCH, DELETE)
        if (this.enableAntiCsrfHeader && isMutatingMethod) {
          request.headers.set('X-Requested-With', 'XMLHttpRequest');
          request.headers.set('X-Hathor-CSRF', '1');
        }

        let cToken = this.csrfToken;
        if (!cToken && this.getCsrfTokenFn) {
          cToken = await this.getCsrfTokenFn();
        }
        if (cToken) {
          request.headers.set('X-CSRF-Token', cToken);
        }

        return request;
      },
      onResponse: async ({ response }) => {
        if (!response.ok) {
          let payload: any = null;
          try {
            payload = await response.clone().json();
          } catch {
            // Fallback for non-JSON responses
          }

          if (payload && typeof payload === 'object' && 'error' in payload && payload.error) {
            const { code, message, correlationId, details } = payload.error;

            const detailsMap: Record<string, string> = {};
            if (Array.isArray(details)) {
              details.forEach((det: ApiErrorDetail) => {
                if (det.field) {
                  detailsMap[det.field] = det.message;
                }
              });
            } else if (details && typeof details === 'object') {
              Object.assign(detailsMap, details);
            }

            throw new GatewayApiError(
              code || `HTTP_${response.status}`,
              message || response.statusText || 'API request failed',
              response.status,
              correlationId,
              Object.keys(detailsMap).length > 0 ? detailsMap : undefined
            );
          }

          throw new GatewayApiError(
            `HTTP_${response.status}`,
            `API request failed with status ${response.status}`,
            response.status
          );
        }
        return response;
      },
    });
  }

  public setAccessToken(token: string | null): void {
    this.accessToken = token;
  }

  public getAccessToken(): string | null {
    return this.accessToken;
  }

  public setCsrfToken(token: string | null): void {
    this.csrfToken = token;
  }

  public getCsrfToken(): string | null {
    return this.csrfToken;
  }

  public get GET() {
    return this.fetchClient.GET;
  }

  public get POST() {
    return this.fetchClient.POST;
  }

  public get PUT() {
    return this.fetchClient.PUT;
  }

  public get DELETE() {
    return this.fetchClient.DELETE;
  }

  public get PATCH() {
    return this.fetchClient.PATCH;
  }

  public get HEAD() {
    return this.fetchClient.HEAD;
  }

  public get OPTIONS() {
    return this.fetchClient.OPTIONS;
  }
}

export function createApiClient(config: ApiClientConfig): ApiClient {
  return new ApiClient(config);
}
