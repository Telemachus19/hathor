import { useQuery } from '@tanstack/react-query';
import { apiBaseUrl } from './index';

export interface RecommendationItem {
  gameId: string;
  title: string;
  slug: string;
  shortDescription: string;
  priceEgp: string;
  bannerUrl: string | null;
  reason: string;
  score?: number;
}

export interface RecommendationResponse {
  success: boolean;
  data: {
    items: RecommendationItem[];
    source: 'cached' | 'rag' | 'gemini_flash' | 'curated_fallback';
    conversationalReply?: string;
    refreshedAt: string;
  };
}

export interface FetchRecommendationsParams {
  gameId?: string;
  prompt?: string;
  ownedGameIds?: string[];
  limit?: number;
  chatHistory?: Array<{ sender: string; text: string }>;
  geminiApiKey?: string;
}

/**
 * Fetches AI-generated hybrid recommendations & conversational responses
 * from the dedicated AI Service via API Gateway (/api/v1/assistant/recommendations).
 */
export async function fetchRecommendations({
  gameId,
  prompt,
  ownedGameIds,
  limit = 6,
  chatHistory,
  geminiApiKey,
}: FetchRecommendationsParams = {}): Promise<RecommendationResponse> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (geminiApiKey) {
    headers['X-Gemini-API-Key'] = geminiApiKey;
  }

  const response = await fetch(`${apiBaseUrl}/assistant/recommendations`, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      gameId,
      prompt,
      ownedGameIds,
      limit,
      chatHistory,
      geminiApiKey,
    }),
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch recommendations: HTTP ${response.status}`);
  }

  return response.json();
}

export function useRecommendations(params: FetchRecommendationsParams = {}) {
  const { gameId, prompt, ownedGameIds, limit = 6 } = params;

  return useQuery({
    queryKey: ['assistant-recommendations', gameId, prompt, ownedGameIds?.join(','), limit],
    queryFn: () => fetchRecommendations({ gameId, prompt, ownedGameIds, limit }),
    staleTime: 60 * 1000,
  });
}
