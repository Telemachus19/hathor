import { useQuery } from '@tanstack/react-query';
import { apiBaseUrl, apiClient } from './index';
import { useAuth } from '../../context/AuthContext';

export interface OwnershipResponse {
  gameId: string;
  owned: boolean;
}

export interface UserLibraryLicense {
  gameId: string;
  sourceOrderId: string;
  pricePaidEgp: string;
  currency: string;
  acquiredAt: string;
}

/**
 * Checks if a specific game is owned by the logged-in user via the API Gateway library service route.
 */
export async function checkGameOwnership(gameId: string): Promise<boolean> {
  if (!gameId) return false;
  const token = apiClient.getAccessToken();
  const response = await fetch(`${apiBaseUrl}/inventory/check/${gameId}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to check game ownership status (HTTP ${response.status})`);
  }
  const data = (await response.json()) as OwnershipResponse;
  return Boolean(data.owned);
}

/**
 * React Query hook for checking game ownership status.
 */
export function useGameOwnership(gameId?: string) {
  const auth = useAuth();
  const isAuthenticated = auth?.isAuthenticated ?? false;

  return useQuery({
    queryKey: ['game-ownership', gameId],
    queryFn: () => checkGameOwnership(gameId!),
    enabled: isAuthenticated && Boolean(gameId),
  });
}

/**
 * Fetches all owned game licenses for the authenticated user.
 */
export async function fetchUserLibrary(): Promise<UserLibraryLicense[]> {
  try {
    const token = apiClient.getAccessToken();
    const response = await fetch(`${apiBaseUrl}/inventory/apps`, {
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    });

    if (!response.ok) return [];
    const json = await response.json();
    return json?.data?.items || [];
  } catch (e) {
    return [];
  }
}

/**
 * React Query hook for fetching full user library licenses.
 */
export function useUserLibrary() {
  const auth = useAuth();
  const isAuthenticated = auth?.isAuthenticated ?? false;

  return useQuery({
    queryKey: ['user-library'],
    queryFn: fetchUserLibrary,
    enabled: isAuthenticated,
    initialData: [],
    refetchInterval: 5000,
  });
}

export interface DownloadTokenResponse {
  url: string;
  expiresAt: string;
  sha256: string;
}

/**
 * Requests a short-lived presigned download URL and SHA-256 checksum for a game build.
 */
export async function requestDownloadUrl(gameId: string): Promise<DownloadTokenResponse> {
  const token = apiClient.getAccessToken();
  const response = await fetch(`${apiBaseUrl}/inventory/games/${gameId}/download`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });

  if (!response.ok) {
    const errorBody = await response.json().catch(() => ({}));
    throw new Error(
      errorBody?.error?.message || `Download authorization failed (HTTP ${response.status})`
    );
  }

  return response.json() as Promise<DownloadTokenResponse>;
}
