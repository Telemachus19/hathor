import { useQuery, useInfiniteQuery } from '@tanstack/react-query';
import { apiBaseUrl } from './index';

/**
 * Catalog item representation matching the public OpenAPI specification.
 */
export interface CatalogGameItem {
  slug: string;
  title: string;
  shortDescription: string;
  priceEgp: string;
  discountPercent?: number;
  bannerUrl?: string;
  status: string;
  tags?: Array<{ name: string; slug: string }>;
  pageTheme?: Record<string, any>;
  createdAt?: string;
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
