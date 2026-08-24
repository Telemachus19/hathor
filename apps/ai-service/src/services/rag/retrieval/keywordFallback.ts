import { eq, and, ne, notInArray } from 'drizzle-orm';
import { catalogDb } from '../../../infrastructure/db/client.js';
import { games } from '../../../infrastructure/db/schema.js';
import type { RecommendationItem, RecommendationResult } from '../types.js';
import {
  extractMeaningfulKeywords,
  isCasualGreetingOrChat,
  isLibraryRecommendationIntent,
} from '../intent.js';

/**
 * Dynamic keyword relevance search fallback when AI API keys are not present.
 * Uses strict stopword filtering and does NOT pad with unrelated 0-score games.
 */
export async function getDynamicKeywordFallback(
  prompt?: string,
  contextGameId?: string,
  ownedGameIds: string[] = [],
  limit = 6
): Promise<RecommendationResult> {
  try {
    const rawPrompt = prompt || '';

    // 1. Handle casual greeting in fallback
    if (isCasualGreetingOrChat(rawPrompt)) {
      return {
        items: [],
        source: 'curated_fallback',
        conversationalReply:
          'Hello! I am your Hathor assistant. Tell me what genres or gameplay styles you enjoy, and I will find the best matches for you!',
        refreshedAt: new Date().toISOString(),
      };
    }

    // 2. Handle empty library request in fallback
    if (isLibraryRecommendationIntent(rawPrompt) && ownedGameIds.length === 0) {
      return {
        items: [],
        source: 'curated_fallback',
        conversationalReply:
          "I don't have any record of games in your library yet! Tell me what kind of genres, themes, or gameplay styles you like (e.g. RPG, Action, Cyberpunk, Stealth), and I'll find great matches for you.",
        refreshedAt: new Date().toISOString(),
      };
    }

    const queryConditions = [eq(games.status, 'published')];
    if (contextGameId) {
      queryConditions.push(ne(games.id, contextGameId));
    }
    if (ownedGameIds.length > 0) {
      queryConditions.push(notInArray(games.id, ownedGameIds));
    }

    const allPublished = await catalogDb
      .select()
      .from(games)
      .where(and(...queryConditions));

    if (allPublished.length === 0) {
      return {
        items: [],
        source: 'curated_fallback',
        conversationalReply: 'No published games found in the catalog.',
        refreshedAt: new Date().toISOString(),
      };
    }

    // Extract only meaningful non-stopword tokens
    const terms = extractMeaningfulKeywords(rawPrompt);

    // If no meaningful search terms extracted and no context game
    if (terms.length === 0 && !contextGameId && ownedGameIds.length === 0) {
      return {
        items: [],
        source: 'curated_fallback',
        conversationalReply:
          'What kind of game are you looking for? Try mentioning genres like Cyberpunk, Stealth, RPG, Space, or Strategy!',
        refreshedAt: new Date().toISOString(),
      };
    }

    // Score games strictly against extracted terms
    const scored = allPublished.map((g) => {
      let score = 0;
      const matchedTerms: string[] = [];
      const titleLower = g.title.toLowerCase();
      const descLower = (g.shortDescription + ' ' + g.fullDescription).toLowerCase();

      terms.forEach((term) => {
        // Full word or substring match with proper weighting
        if (titleLower.includes(term)) {
          score += 10;
          matchedTerms.push(term);
        }
        if (descLower.includes(term)) {
          score += 3;
          if (!matchedTerms.includes(term)) matchedTerms.push(term);
        }
      });

      return {
        game: g,
        score,
        matchedTerms,
      };
    });

    // Filter to ONLY items that actually matched (score > 0)
    let filteredScored = scored.filter((s) => s.score > 0);

    // If contextGameId or library-based, allow top catalog items if no term matched
    if (filteredScored.length === 0 && (contextGameId || ownedGameIds.length > 0)) {
      filteredScored = scored.slice(0, 3);
    }

    if (filteredScored.length === 0) {
      return {
        items: [],
        source: 'curated_fallback',
        conversationalReply: `I couldn't find any games matching "${rawPrompt}". Try searching for genres like Cyberpunk, Stealth, Action, RPG, or Space!`,
        refreshedAt: new Date().toISOString(),
      };
    }

    filteredScored.sort((a, b) => b.score - a.score);
    const topScored = filteredScored.slice(0, limit);

    const items: RecommendationItem[] = topScored.map((s) => {
      const g = s.game;
      let reason = 'Curated highlight from the Hathor catalog.';
      if (s.matchedTerms.length > 0) {
        reason = `Matches search terms (${s.matchedTerms.join(', ')}).`;
      } else if (contextGameId) {
        reason = 'Recommended based on the game you are viewing.';
      } else if (ownedGameIds.length > 0) {
        reason = 'Recommended based on games in your collection.';
      }

      return {
        gameId: g.id,
        title: g.title,
        slug: g.slug,
        shortDescription: g.shortDescription,
        priceEgp: g.priceEgp,
        bannerUrl: g.bannerUrl,
        score: s.score,
        reason,
      };
    });

    return {
      items,
      source: 'curated_fallback',
      conversationalReply: `I found ${items.length} title${items.length === 1 ? '' : 's'} matching your search!`,
      refreshedAt: new Date().toISOString(),
    };
  } catch (error) {
    console.error('[AI Service] Error in dynamic keyword fallback:', error);
    return {
      items: [],
      source: 'curated_fallback',
      refreshedAt: new Date().toISOString(),
    };
  }
}
