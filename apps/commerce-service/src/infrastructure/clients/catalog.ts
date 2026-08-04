import { randomUUID } from 'node:crypto';
import { DependencyUnavailableError } from './library.js';

let cachedToken: string | null = null;
let cachedTokenExpiry = 0; // Epoch seconds

export interface CatalogQuoteItem {
  gameId: string;
  title: string;
  sellable: boolean;
  priceEgp: string;
  currency: 'EGP';
  priceVersion: string;
}

export interface CatalogQuoteResponse {
  quoteId: string;
  expiresAt: string;
  items: CatalogQuoteItem[];
}

/**
 * Requests an internal service-to-service token for catalog-service from auth-service.
 * Reuses the token if it's cached and valid.
 */
async function getServiceToken(): Promise<string> {
  const now = Math.floor(Date.now() / 1000);

  if (cachedToken && cachedTokenExpiry > now + 10) {
    return cachedToken;
  }

  const authServiceUrl = process.env.AUTH_SERVICE_URL || 'http://localhost:5001';
  const url = `${authServiceUrl}/internal/v1/auth/service-tokens`;
  const clientId = 'commerce-service';
  const clientSecret = process.env.COMMERCE_SERVICE_SECRET || 'commerce-service-secret-phrase';

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Hathor-Service-Credential': `${clientId}:${clientSecret}`,
      },
      body: JSON.stringify({ audience: 'catalog-service' }),
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch catalog service token: ${response.statusText}`);
    }

    const data = await (response.json() as Promise<{ accessToken: string; expiresIn: number }>);
    cachedToken = data.accessToken;
    cachedTokenExpiry = Math.floor(Date.now() / 1000) + data.expiresIn;
    return cachedToken;
  } catch (error: any) {
    console.error('Failed to get service-to-service token for catalog:', error.message);
    throw new DependencyUnavailableError('Auth service token request failed');
  }
}

/**
 * Inter-service client calling catalog-service to obtain price and sellability quotes.
 * Bounded by a 5-second timeout and fails closed on connection/timeout error.
 */
export async function getCatalogQuotes(
  gameIds: string[],
  correlationId: string = randomUUID()
): Promise<CatalogQuoteResponse> {
  if (gameIds.length === 0) {
    return {
      quoteId: randomUUID(),
      expiresAt: new Date(Date.now() + 15 * 60 * 1000).toISOString(),
      items: [],
    };
  }

  const token = await getServiceToken();
  const catalogServiceUrl = process.env.CATALOG_SERVICE_URL || 'http://localhost:5002';
  const url = `${catalogServiceUrl}/internal/v1/catalog/quotes`;

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
        'X-Correlation-ID': correlationId,
      },
      body: JSON.stringify({ gameIds }),
      signal: AbortSignal.timeout(5000),
    });

    if (!response.ok) {
      throw new Error(`Catalog service returned status ${response.status}: ${response.statusText}`);
    }

    const data = await (response.json() as Promise<CatalogQuoteResponse>);
    return data;
  } catch (error: any) {
    console.error('Catalog quote check failed:', error.message);
    throw new DependencyUnavailableError('Catalog service quote request failed');
  }
}
