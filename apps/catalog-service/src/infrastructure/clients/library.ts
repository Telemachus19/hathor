import { randomUUID } from 'node:crypto';

let cachedToken: string | null = null;
let cachedTokenExpiry = 0; // Epoch seconds

export class DependencyUnavailableError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'DependencyUnavailableError';
  }
}

export interface MonthlyAnalyticsStat {
  year: number;
  month: string;
  monthIndex: number;
  newOwners: number;
  revenue: number;
  cumOwners: number;
}

export interface GameAnalyticsResponse {
  totalOwners: number;
  grossRevenueEgp: number;
  totalRevenueEgp: string;
  averageRating: number;
  reviewCount: number;
  lifetimePurchases: number;
  monthlyPurchases: { year: number; month: number; amount: number }[];
  monthlyStats: MonthlyAnalyticsStat[];
}

/**
 * Requests an internal service-to-service token for library-service from auth-service.
 * Reuses the token if it's cached and valid.
 */
async function getServiceToken(): Promise<string> {
  const now = Math.floor(Date.now() / 1000);

  if (cachedToken && cachedTokenExpiry > now + 10) {
    return cachedToken;
  }

  const authServiceUrl = process.env.AUTH_SERVICE_URL || 'http://localhost:5001';
  const url = `${authServiceUrl}/internal/v1/auth/service-tokens`;
  const clientId = 'catalog-service';
  const clientSecret = process.env.CATALOG_SERVICE_SECRET || 'catalog-service-secret-phrase';

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Hathor-Service-Credential': `${clientId}:${clientSecret}`,
      },
      body: JSON.stringify({ audience: 'library-service' }),
    });

    if (!response.ok) {
      throw new Error(
        `Failed to fetch library service token: ${response.statusText} (${response.status})`
      );
    }

    const data = await (response.json() as Promise<{ accessToken: string; expiresIn: number }>);
    cachedToken = data.accessToken;
    cachedTokenExpiry = Math.floor(Date.now() / 1000) + data.expiresIn;
    return cachedToken;
  } catch (error: any) {
    console.error('Failed to get service-to-service token for library:', error.message);
    throw new DependencyUnavailableError('Auth service token request failed');
  }
}

/**
 * Inter-service client calling library-service to fetch game analytics.
 * Protected by RS256 token and bounded by a 5-second timeout.
 */
export async function getGameAnalytics(
  gameId: string,
  correlationId: string = randomUUID()
): Promise<GameAnalyticsResponse> {
  const token = await getServiceToken();
  const libraryServiceUrl = process.env.LIBRARY_SERVICE_URL || 'http://localhost:5004';
  const url = `${libraryServiceUrl}/internal/v1/library/analytics/${gameId}`;

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
        'X-Correlation-ID': correlationId,
      },
      signal: AbortSignal.timeout(5000),
    });

    if (!response.ok) {
      throw new Error(`Library service returned status ${response.status}: ${response.statusText}`);
    }

    const data = await (response.json() as Promise<GameAnalyticsResponse>);
    return data;
  } catch (error: any) {
    console.error(`Library analytics fetch failed for game ${gameId}:`, error.message);
    throw new DependencyUnavailableError(
      `Library service analytics request failed: ${error.message}`
    );
  }
}
