import { useQuery } from '@tanstack/react-query';
import { apiBaseUrl, apiClient } from './index';
import { useAuth } from '../../context/AuthContext';

export interface OwnershipResponse {
  gameId: string;
  owned: boolean;
}

/**
 * Checks if a specific game is owned by the logged-in user via the API Gateway library service route.
 */
export async function checkGameOwnership(gameId: string): Promise<boolean> {
  if (!gameId) return false;
  try {
    const token = apiClient.getAccessToken();
    const response = await fetch(`${apiBaseUrl}/inventory/check/${gameId}`, {
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    });

    if (!response.ok) return false;
    const data = (await response.json()) as OwnershipResponse;
    return Boolean(data.owned);
  } catch (e) {
    return false;
  }
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
    initialData: false,
  });
}
