import { eq, and, ne, inArray, notInArray } from 'drizzle-orm';
import { catalogDb } from '../../infrastructure/db/client.js';
import { games } from '../../infrastructure/db/schema.js';
import type { RecommendationItem, RecommendationResult, ChatMessage } from './types.js';
import {
  extractMeaningfulKeywords,
  isCasualGreetingOrChat,
  isLibraryRecommendationIntent,
} from './intent.js';
import { generateGeminiFlashResponse } from './geminiAssistant.js';
import { getDynamicKeywordFallback, retrieveVectorCandidates } from './retrieval/index.js';

/**
 * Core Hybrid RAG + Direct LLM Discovery Assistant logic with Library Awareness
 */
export async function getHybridRecommendations(
  prompt?: string,
  contextGameId?: string,
  ownedGameIds: string[] = [],
  limit = 6,
  chatHistory: ChatMessage[] = [],
  apiKeyOverride?: string
): Promise<RecommendationResult> {
  const effectiveGeminiKey = apiKeyOverride || process.env.GEMINI_API_KEY;
  const rawPrompt = (prompt || '').trim();

  try {
    const ownedSet = new Set(ownedGameIds);
    let candidateItems: RecommendationItem[] = [];
    let candidateSource: 'rag' | 'curated_fallback' = 'curated_fallback';

    // 1. Fetch owned games metadata if user has games in library
    let ownedGamesData: Array<{ id: string; title: string; shortDescription: string }> = [];
    let ownedSummaryStr: string | undefined;

    if (ownedGameIds.length > 0) {
      try {
        ownedGamesData = await catalogDb
          .select({ id: games.id, title: games.title, shortDescription: games.shortDescription })
          .from(games)
          .where(inArray(games.id, ownedGameIds));

        if (ownedGamesData.length > 0) {
          ownedSummaryStr = ownedGamesData
            .map((og) => `"${og.title}" (${og.shortDescription})`)
            .join(', ');
        }
      } catch (err) {
        console.warn('[AI Service] Failed to retrieve owned games data:', err);
      }
    }

    // 2. Determine search query string for Vector Embedding retrieval
    const isLibraryIntent = isLibraryRecommendationIntent(rawPrompt);
    let vectorQueryText: string | null = null;

    if (isLibraryIntent && ownedGamesData.length > 0) {
      vectorQueryText = `Games similar to player library favorites: ${ownedSummaryStr}`;
    } else if (rawPrompt && !isCasualGreetingOrChat(rawPrompt)) {
      const meaningfulTerms = extractMeaningfulKeywords(rawPrompt);
      vectorQueryText = meaningfulTerms.length > 0 ? meaningfulTerms.join(' ') : rawPrompt;
    } else if (contextGameId) {
      vectorQueryText = `Games similar to game id ${contextGameId}`;
    }

    // 3. Vector Embedding Candidate Retrieval (Gemini Embeddings)
    if (vectorQueryText && effectiveGeminiKey) {
      const vectorCandidates = await retrieveVectorCandidates({
        queryText: vectorQueryText,
        contextGameId,
        ownedSet,
        apiKey: effectiveGeminiKey,
        threshold: 0.25,
        limit: 10,
      });

      if (vectorCandidates.length > 0) {
        candidateItems = vectorCandidates;
        candidateSource = 'rag';
      }
    }

    // 4. Keyword Fallback Candidate Retrieval if Vector search returned empty
    if (candidateItems.length === 0 && !isCasualGreetingOrChat(rawPrompt)) {
      const keywordResult = await getDynamicKeywordFallback(
        rawPrompt,
        contextGameId,
        ownedGameIds,
        10
      );
      candidateItems = keywordResult.items;
      candidateSource = keywordResult.source as 'curated_fallback';
    }

    // If still empty and Gemini is active, let's load published unowned games as candidate options so Gemini can evaluate
    if (candidateItems.length === 0 && effectiveGeminiKey && !isCasualGreetingOrChat(rawPrompt)) {
      try {
        const queryConditions = [eq(games.status, 'published')];
        if (contextGameId) queryConditions.push(ne(games.id, contextGameId));
        if (ownedGameIds.length > 0) queryConditions.push(notInArray(games.id, ownedGameIds));

        const allPublished = await catalogDb
          .select()
          .from(games)
          .where(and(...queryConditions))
          .limit(15);

        candidateItems = allPublished.map((g) => ({
          gameId: g.id,
          title: g.title,
          slug: g.slug,
          shortDescription: g.shortDescription,
          priceEgp: g.priceEgp,
          bannerUrl: g.bannerUrl,
          reason: 'Curated title from Hathor catalog.',
        }));
      } catch {
        // Ignore
      }
    }

    // 5. Conversational AI Synthesis via Google Gemini API
    if (effectiveGeminiKey && rawPrompt) {
      const geminiResult = await generateGeminiFlashResponse(
        rawPrompt,
        candidateItems,
        ownedSummaryStr,
        chatHistory,
        effectiveGeminiKey
      );

      if (geminiResult) {
        // If not a recommendation or no games selected, return empty items array (no game cards!)
        if (!geminiResult.isRecommendation || geminiResult.recommendedGameIds.length === 0) {
          return {
            items: [],
            source: 'gemini_flash',
            conversationalReply: geminiResult.reply,
            refreshedAt: new Date().toISOString(),
          };
        }

        // Filter candidate items to ONLY the ones Gemini explicitly selected
        const selectedIdSet = new Set(geminiResult.recommendedGameIds);
        const selectedItems = candidateItems
          .filter((item) => selectedIdSet.has(item.gameId))
          .map((item) => ({
            ...item,
            reason: geminiResult.gameReasons[item.gameId] || item.reason,
          }));

        return {
          items: selectedItems,
          source: 'gemini_flash',
          conversationalReply: geminiResult.reply,
          refreshedAt: new Date().toISOString(),
        };
      }
    }

    // 6. Fallback if Gemini key is absent or failed
    if (isCasualGreetingOrChat(rawPrompt)) {
      return {
        items: [],
        source: 'curated_fallback',
        conversationalReply:
          'Hello! I am your Hathor assistant. Ask me about games, genres, or recommendations!',
        refreshedAt: new Date().toISOString(),
      };
    }

    return {
      items: candidateItems.slice(0, limit),
      source: candidateSource,
      conversationalReply:
        candidateItems.length > 0
          ? `Here are the top matches found in the Hathor catalog.`
          : `No matches found. Tell me what genres or game styles you enjoy!`,
      refreshedAt: new Date().toISOString(),
    };
  } catch (error) {
    console.error('[AI Service] Unhandled error in getHybridRecommendations:', error);
    return await getDynamicKeywordFallback(rawPrompt, contextGameId, ownedGameIds, limit);
  }
}
