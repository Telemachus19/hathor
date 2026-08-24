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

export interface DesignerChatParams {
  gameId: string;
  message: string;
  currentTheme?: any;
  conversationHistory?: Array<{ role: 'user' | 'model'; content: string }>;
  provider?: 'gemini' | 'glm' | 'auto';
  model?: string;
  token?: string;
}

export interface DesignerChatResponse {
  success: boolean;
  data?: {
    reply: string;
    proposedTheme?: any;
    changeSummary?: string[];
    actionsTaken?: string[];
    validationResult?: any;
    providerUsed?: 'gemini' | 'glm';
  };
  error?: {
    code: string;
    message: string;
  };
}

/**
 * Sends a designer chat message to the dedicated AI Service
 * via API Gateway (/api/v1/ai/games/:gameId/designer-chat).
 */
export async function sendDesignerChat({
  gameId,
  message,
  currentTheme,
  conversationHistory,
  provider,
  model,
  token,
}: DesignerChatParams): Promise<DesignerChatResponse> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (token) {
    headers['Authorization'] = token.startsWith('Bearer ') ? token : `Bearer ${token}`;
  }

  const cleanGameId = gameId || 'draft';
  try {
    const response = await fetch(`${apiBaseUrl}/ai/games/${encodeURIComponent(cleanGameId)}/designer-chat`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        message,
        currentTheme,
        conversationHistory,
        provider,
        model,
      }),
    });

    const contentType = response.headers.get('content-type') || '';
    if (contentType.includes('application/json')) {
      const data = (await response.json()) as DesignerChatResponse;
      return data;
    }

    const text = await response.text();
    return {
      success: false,
      error: {
        code: `HTTP_${response.status}`,
        message: text.slice(0, 300) || `Server returned HTTP ${response.status} (${response.statusText})`,
      },
    };
  } catch (err: any) {
    return {
      success: false,
      error: {
        code: 'NETWORK_ERROR',
        message: err.message || 'Failed to connect to AI Service.',
      },
    };
  }
}


