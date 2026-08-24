import type { ThemeValidationResult } from '../../utils/themeValidator.js';

export interface AgentChatMessage {
  role: 'user' | 'model';
  content: string;
}

export interface AgentChatInput {
  gameId: string;
  message: string;
  currentTheme?: any;
  conversationHistory?: AgentChatMessage[];
  provider?: 'gemini' | 'glm' | 'auto';
  model?: string;
  authToken?: string;
}

export interface AgentChatResponse {
  reply: string;
  proposedTheme?: any;
  changeSummary?: string[];
  actionsTaken?: string[];
  validationResult?: ThemeValidationResult;
  providerUsed?: 'gemini' | 'glm';
}

export interface ProviderGenerationResult {
  text: string;
  modelUsed: string;
}

export interface GameMetadataResult {
  id?: string;
  title: string;
  genre: string;
  shortDescription: string;
  fullDescription?: string;
  priceEgp?: string;
  bannerUrl?: string;
  screenshots?: string[];
  tags: string[];
  error?: string;
}
