import type { ApiError, ApiErrorDetail } from '@hathor/contracts';

export type ApiClientConfig = {
  baseUrl: string;
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
    details?: Record<string, string | string[]>,
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
  constructor(private readonly config: ApiClientConfig) {}

  async request<T>(path: string, options?: RequestInit): Promise<T> {
    let response: Response;
    try {
      response = await fetch(`${this.config.baseUrl}${path}`, {
        ...options,
        credentials: 'include', // for HttpOnly Refresh Cookie
        headers: {
          'Content-Type': 'application/json',
          ...options?.headers,
        },
      });
    } catch {
      throw new GatewayApiError(
        'NETWORK_ERROR',
        'Unable to connect to gateway service. Please check your network connection.',
        0,
      );
    }

    if (!response.ok) {
      let payload: ApiError | any = null;
      try {
        payload = await response.json();
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
          Object.keys(detailsMap).length > 0 ? detailsMap : undefined,
        );
      }

      throw new GatewayApiError(
        `HTTP_${response.status}`,
        `API request failed with status ${response.status}`,
        response.status,
      );
    }

    if (response.status === 204) {
      return undefined as T;
    }

    const data = await response.json();
    if (data && typeof data === 'object' && 'success' in data && data.success === true && 'data' in data) {
      return data.data as T;
    }

    return data as T;
  }
}