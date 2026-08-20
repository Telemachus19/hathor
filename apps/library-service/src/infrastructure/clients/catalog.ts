import { randomUUID } from 'node:crypto';

let cachedToken: string | null = null;
let cachedTokenExpiry = 0; // Epoch seconds

export interface PublishedBuildMetadata {
  buildId: string;
  gameId: string;
  version: string;
  objectKey: string;
  sha256: string;
  sizeBytes: number;
  state: string;
}

export class DependencyUnavailableError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'DependencyUnavailableError';
  }
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
  const clientId = 'library-service';
  const clientSecret = process.env.LIBRARY_SERVICE_SECRET || 'library-service-secret-phrase';

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
 * Inter-service client calling catalog-service to retrieve published build metadata.
 * Bounded by a 5-second timeout and fails closed on connection/timeout/forbidden errors.
 */
export async function getPublishedBuild(
  gameId: string,
  correlationId: string = randomUUID()
): Promise<PublishedBuildMetadata | null> {
  const token = await getServiceToken();
  const catalogServiceUrl = process.env.CATALOG_SERVICE_URL || 'http://localhost:5002';
  const url = `${catalogServiceUrl}/internal/v1/catalog/games/${gameId}/published-build`;

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
        'X-Correlation-ID': correlationId,
      },
      signal: AbortSignal.timeout(5000),
    });

    if (response.status === 404) {
      return null;
    }

    if (response.status === 403) {
      throw new Error('GAME_SUSPENDED_OR_REVOKED');
    }

    if (!response.ok) {
      throw new Error(`Catalog service returned status ${response.status}: ${response.statusText}`);
    }

    const data = await (response.json() as Promise<PublishedBuildMetadata>);
    return data;
  } catch (error: any) {
    if (error.message === 'GAME_SUSPENDED_OR_REVOKED') {
      throw error;
    }
    console.error('Catalog published build check failed:', error.message);
    throw new DependencyUnavailableError('Catalog service published build request failed');
  }
}
