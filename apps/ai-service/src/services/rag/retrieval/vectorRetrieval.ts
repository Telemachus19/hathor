import { eq, and, inArray } from 'drizzle-orm';
import { catalogDb } from '../../../infrastructure/db/client.js';
import { games, gameEmbeddings } from '../../../infrastructure/db/schema.js';
import type { RecommendationItem } from '../types.js';
import { computeCosineSimilarity, generateEmbedding } from '../vectorUtils.js';

export interface RetrieveVectorOptions {
  queryText: string;
  contextGameId?: string;
  ownedSet: Set<string>;
  apiKey: string;
  threshold?: number;
  limit?: number;
}

export async function retrieveVectorCandidates(
  options: RetrieveVectorOptions
): Promise<RecommendationItem[]> {
  const { queryText, contextGameId, ownedSet, apiKey, threshold = 0.25, limit = 10 } = options;

  try {
    const queryVector = await generateEmbedding(queryText, apiKey);
    if (!queryVector) return [];

    const storedEmbeddings = await catalogDb.select().from(gameEmbeddings);
    if (storedEmbeddings.length === 0) return [];

    const scoredGames = storedEmbeddings
      .map((row: typeof gameEmbeddings.$inferSelect) => ({
        gameId: row.gameId,
        score: computeCosineSimilarity(queryVector, row.embedding as number[]),
      }))
      .filter((sg: { gameId: string; score: number }) => {
        if (contextGameId && sg.gameId === contextGameId) return false;
        if (ownedSet.has(sg.gameId)) return false;
        return sg.score > threshold;
      })
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);

    if (scoredGames.length === 0) return [];

    const topGameIds = scoredGames.map((sg) => sg.gameId);
    const matchedGames = await catalogDb
      .select()
      .from(games)
      .where(and(eq(games.status, 'published'), inArray(games.id, topGameIds)));

    const scoreMap = new Map(scoredGames.map((sg) => [sg.gameId, sg.score]));

    return matchedGames.map((g) => {
      const score = scoreMap.get(g.id) || 0;
      return {
        gameId: g.id,
        title: g.title,
        slug: g.slug,
        shortDescription: g.shortDescription,
        priceEgp: g.priceEgp,
        bannerUrl: g.bannerUrl,
        score,
        reason: `Catalog match (${Math.round(score * 100)}% similarity).`,
      };
    });
  } catch (vectorErr) {
    console.warn('[AI Service] Vector search error:', vectorErr);
    return [];
  }
}
