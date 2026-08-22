import { useQuery, useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient, apiBaseUrl } from './index';

/**
 * Catalog item representation matching the public OpenAPI specification.
 */
export interface CatalogGameItem {
  id?: string;
  slug: string;
  title: string;
  subtitle?: string;
  shortDescription: string;
  fullDescription?: string;
  priceEgp: string;
  discountPercent?: number;
  bannerUrl?: string;
  screenshots?: string[];
  trailerUrl?: string;
  systemRequirements?: any;
  genre?: { id?: number; name: string; slug: string };
  category?: string;
  developer?: string;
  publisher?: string;
  releaseDate?: string;
  platforms?: string[];
  status: string;
  tags?: Array<{ id?: number; name: string; slug: string }>;
  pageTheme?: Record<string, any>;
  createdAt?: string;
  updatedAt?: string;
}

/**
 * Pagination metadata returned by list queries.
 */
export interface PaginationMeta {
  page: number;
  limit: number;
  totalItems: number;
  totalPages: number;
}

/**
 * Catalog API standard success payload wrapper.
 */
export interface CatalogResponse {
  success: boolean;
  data: {
    items: CatalogGameItem[];
    pagination: PaginationMeta;
  };
}

/**
 * Query parameters for filtering and paginating catalog games.
 */
export interface FetchCatalogParams {
  tag?: string;
  page?: number;
  limit?: number;
}

/**
 * Fetches published games from the Catalog Service via API Gateway.
 */
export async function fetchStoreGames({
  tag,
  page = 1,
  limit = 10,
}: FetchCatalogParams): Promise<CatalogResponse> {
  const queryParams = new URLSearchParams();
  if (page) queryParams.set('page', String(page));
  if (limit) queryParams.set('limit', String(limit));
  if (tag && tag.toUpperCase() !== 'ALL') queryParams.set('tag', tag.toLowerCase());

  const response = await fetch(`${apiBaseUrl}/store/games?${queryParams.toString()}`);

  if (!response.ok) {
    throw new Error(`Failed to fetch catalog games: HTTP ${response.status}`);
  }

  return response.json();
}

/**
 * React Query hook for fetching and caching catalog game listings.
 */
export function useCatalogGames(params: FetchCatalogParams = {}) {
  const { tag, page = 1, limit = 10 } = params;

  return useQuery({
    queryKey: ['store-games', tag, page, limit],
    queryFn: () => fetchStoreGames({ tag, page, limit }),
  });
}

/**
 * React Query infinite scroll hook for fetching paginated catalog games sequentially.
 */
export function useInfiniteCatalogGames(params: Omit<FetchCatalogParams, 'page'> = {}) {
  const { tag, limit = 8 } = params;

  return useInfiniteQuery({
    queryKey: ['infinite-store-games', tag, limit],
    queryFn: ({ pageParam = 1 }) => fetchStoreGames({ tag, page: pageParam, limit }),
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      const { page, totalPages } = lastPage.data.pagination;
      return page < totalPages ? page + 1 : undefined;
    },
  });
}

export function useCatalogGenres() {
  return useQuery<{ id: number; name: string; slug: string }[]>({
    queryKey: ['creator-genres'],
    queryFn: async () => {
      try {
        const res = (await apiClient.GET('/creator/genres' as any, {} as any)) as any;
        if (res.data) {
          return Array.isArray(res.data) ? res.data : res.data.items || [];
        }
        return [];
      } catch {
        return [];
      }
    },
    staleTime: 5 * 60 * 1000,
  });
}

export function useCatalogTags() {
  return useQuery<{ id: number; name: string; slug: string }[]>({
    queryKey: ['creator-tags'],
    queryFn: async () => {
      try {
        const res = (await apiClient.GET('/creator/tags' as any, {} as any)) as any;
        if (res.data) {
          return Array.isArray(res.data) ? res.data : res.data.items || [];
        }
        return [];
      } catch {
        return [];
      }
    },
    staleTime: 5 * 60 * 1000,
  });
}

/**
 * Fetches single game details by slug from the Catalog Service API.
 */
export async function fetchGameBySlug(slug: string): Promise<CatalogGameItem | null> {
  try {
    const response = await fetch(`${apiBaseUrl}/store/games/${slug}`);
    if (!response.ok) return null;
    const json = await response.json();
    return json.data || null;
  } catch (e) {
    return null;
  }
}

/**
 * React Query hook for fetching and caching single game details.
 */
export function useGameBySlug(slug?: string) {
  return useQuery({
    queryKey: ['game-detail', slug],
    queryFn: () => (slug ? fetchGameBySlug(slug) : null),
    enabled: !!slug,
  });
}

/**
 * Updates a game theme payload on the Catalog Service via API Gateway using the game slug.
 * Enforces creator authorization and owner verification.
 */
export async function updateGameTheme(
  slug: string,
  pageTheme: Record<string, any>,
  token?: string
): Promise<{ success: boolean; data?: any; error?: any }> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${apiBaseUrl}/creator/games/${slug}/theme`, {
    method: 'PUT',
    headers,
    body: JSON.stringify(pageTheme),
  });

  return response.json();
}

/**
 * Creates a draft game on the Catalog Service via API Gateway.
 * Forces status = "draft" and pageTheme = {}.
 */
export async function createCreatorGame(
  gameData: Record<string, any>,
  token?: string
): Promise<{ success: boolean; data?: any; error?: any }> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${apiBaseUrl}/creator/games`, {
    method: 'POST',
    headers,
    body: JSON.stringify(gameData),
  });

  return response.json();
}

/**
 * Game review item representation from the catalog service.
 */
export interface GameReviewItem {
  id: string;
  userId: string;
  sentiment: 'positive' | 'mixed' | 'negative';
  content: string;
  createdAt?: string;
  updatedAt?: string;
}

/**
 * Calculated sentiment breakdown item.
 */
export interface ReviewBreakdownItem {
  sentiment: 'positive' | 'mixed' | 'negative';
  label: string;
  count: number;
  percent: number;
}

/**
 * Response payload for game reviews endpoint.
 */
export interface GameReviewsData {
  reviews: GameReviewItem[];
  totalReviews: number;
  breakdown: ReviewBreakdownItem[];
}

/**
 * Fetches all reviews and breakdown for a game by slug or ID.
 */
export async function fetchGameReviews(slugOrId: string): Promise<GameReviewsData | null> {
  try {
    const response = await fetch(`${apiBaseUrl}/store/games/${slugOrId}/reviews`);
    if (!response.ok) return null;
    const json = await response.json();
    return json.data || null;
  } catch (e) {
    return null;
  }
}

/**
 * React Query hook for fetching and caching game reviews.
 */
export function useGameReviews(slugOrId?: string) {
  return useQuery({
    queryKey: ['game-reviews', slugOrId],
    queryFn: () => (slugOrId ? fetchGameReviews(slugOrId) : null),
    enabled: !!slugOrId,
  });
}

/**
 * Fetches the current logged-in user's review for a game.
 */
export async function fetchMyGameReview(
  slugOrId: string,
  token?: string
): Promise<GameReviewItem | null> {
  if (!token) return null;
  try {
    const response = await fetch(`${apiBaseUrl}/store/games/${slugOrId}/reviews/mine`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    if (!response.ok) return null;
    const json = await response.json();
    return json.data?.review || null;
  } catch (e) {
    return null;
  }
}

/**
 * React Query hook for fetching the current user's review for a game.
 */
export function useMyGameReview(slugOrId?: string, token?: string) {
  return useQuery({
    queryKey: ['my-game-review', slugOrId, token],
    queryFn: () => (slugOrId && token ? fetchMyGameReview(slugOrId, token) : null),
    enabled: !!slugOrId && !!token,
  });
}

/**
 * Submits or updates a review for a game.
 */
export async function submitGameReview(
  slugOrId: string,
  payload: { sentiment: 'positive' | 'mixed' | 'negative'; content: string },
  token: string
): Promise<{ success: boolean; data?: { review: GameReviewItem }; error?: any }> {
  const response = await fetch(`${apiBaseUrl}/store/games/${slugOrId}/reviews`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });

  return response.json();
}

/**
 * React Query hook for submitting or updating a game review.
 */
export function useSubmitGameReview() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      slugOrId,
      payload,
      token,
    }: {
      slugOrId: string;
      payload: { sentiment: 'positive' | 'mixed' | 'negative'; content: string };
      token: string;
    }) => submitGameReview(slugOrId, payload, token),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['game-reviews', variables.slugOrId] });
      queryClient.invalidateQueries({ queryKey: ['my-game-review', variables.slugOrId] });
    },
  });
}
