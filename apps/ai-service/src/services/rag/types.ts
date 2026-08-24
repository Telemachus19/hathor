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

export interface RecommendationResult {
  items: RecommendationItem[];
  source: 'cached' | 'rag' | 'gemini_flash' | 'curated_fallback';
  conversationalReply?: string;
  refreshedAt: string;
}

export interface GeminiFlashResponse {
  reply: string;
  isRecommendation: boolean;
  recommendedGameIds: string[];
  gameReasons: Record<string, string>;
}

export interface ChatMessage {
  sender: string;
  text: string;
}

export interface CandidateGame {
  gameId: string;
  title: string;
  shortDescription: string;
  priceEgp: string;
  reason?: string;
}
