import { randomUUID } from 'node:crypto';

let cachedToken: string | null = null;
let cachedTokenExpiry = 0; // Epoch seconds

// Custom error to represent microservice dependency issues
export class DependencyUnavailableError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'DependencyUnavailableError';
  }
}

/**
 * Requests an internal service-to-service token from the auth-service.
 * Reuses the token if it's cached and valid.
 */
async function getServiceToken(): Promise<string> {
  const now = Math.floor(Date.now() / 1000);

  // Re-use token if it is still valid for at least 10 more seconds
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
      body: JSON.stringify({ audience: 'library-service' }),
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch service token: ${response.statusText}`);
    }

    const data = await (response.json() as Promise<{ accessToken: string; expiresIn: number }>);
    cachedToken = data.accessToken;
    cachedTokenExpiry = Math.floor(Date.now() / 1000) + data.expiresIn;
    return cachedToken;
  } catch (error: any) {
    console.error('Failed to get service-to-service token:', error.message);
    throw new DependencyUnavailableError('Auth service token request failed');
  }
}

/**
 * Inter-service client calling library-service to check game ownership for a user.
 * Bounded by a 5-second timeout and fails closed on connection/timeout error.
 */
export async function checkLibraryOwnership(
  userId: string,
  gameIds: string[],
  correlationId: string = randomUUID()
): Promise<string[]> {
  if (gameIds.length === 0) {
    return [];
  }

  const token = await getServiceToken();
  const libraryServiceUrl = process.env.LIBRARY_SERVICE_URL || 'http://localhost:5004';
  const url = `${libraryServiceUrl}/internal/v1/library/ownership-check`;

  try {
    // Perform internal POST request with a 5-second timeout signal
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
        'X-Correlation-ID': correlationId,
      },
      body: JSON.stringify({ userId, gameIds }),
      signal: AbortSignal.timeout(5000),
    });

    if (!response.ok) {
      throw new Error(`Library service returned status ${response.status}: ${response.statusText}`);
    }

    const data = await (response.json() as Promise<{ ownedGameIds: string[] }>);
    return data.ownedGameIds;
  } catch (error: any) {
    console.error('Library ownership check failed:', error.message);
    throw new DependencyUnavailableError('Library service ownership check failed');
  }
}
