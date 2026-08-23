import { createHash } from 'crypto';
import { eq, and, desc, ne, inArray, notInArray } from 'drizzle-orm';
import fs from 'fs';
import path from 'path';

// Load local .env for convenient local runs when process env vars are not exported
try {
  const envPath = path.join(process.cwd(), 'hathor', '.env');
  if (fs.existsSync(envPath)) {
    const content = fs.readFileSync(envPath, 'utf8');
    content.split(/\r?\n/).forEach((line) => {
      const m = line.match(/^([^#=]+)=(.*)$/);
      if (m) {
        const k = m[1].trim();
        let v = m[2].trim();
        v = v.replace(/^\"|\"$/g, '').replace(/^'|'$/g, '');
        if (!process.env[k]) process.env[k] = v;
      }
    });
  }
} catch {
  // ignore local .env load failures
}

import { catalogDb } from '../infrastructure/db/client.js';
import { games, gameEmbeddings } from '../infrastructure/db/schema.js';

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

/**
 * Standard stop words & conversational filler set
 */
export const STOP_WORDS = new Set([
  'a',
  'about',
  'above',
  'after',
  'again',
  'against',
  'all',
  'am',
  'an',
  'and',
  'any',
  'are',
  'aren',
  'as',
  'at',
  'be',
  'because',
  'been',
  'before',
  'being',
  'below',
  'between',
  'both',
  'but',
  'by',
  'can',
  'cannot',
  'could',
  'did',
  'do',
  'does',
  'doing',
  'down',
  'during',
  'each',
  'few',
  'for',
  'from',
  'further',
  'had',
  'has',
  'have',
  'having',
  'he',
  'her',
  'here',
  'hers',
  'herself',
  'him',
  'himself',
  'his',
  'how',
  'i',
  'if',
  'in',
  'into',
  'is',
  'it',
  'its',
  'itself',
  'let',
  'me',
  'more',
  'most',
  'my',
  'myself',
  'no',
  'nor',
  'not',
  'of',
  'off',
  'on',
  'once',
  'only',
  'or',
  'other',
  'ought',
  'our',
  'ours',
  'ourselves',
  'out',
  'over',
  'own',
  'same',
  'she',
  'should',
  'so',
  'some',
  'such',
  'than',
  'that',
  'the',
  'their',
  'theirs',
  'them',
  'themselves',
  'then',
  'there',
  'these',
  'they',
  'this',
  'those',
  'through',
  'to',
  'too',
  'under',
  'until',
  'up',
  'very',
  'was',
  'we',
  'were',
  'what',
  'when',
  'where',
  'which',
  'while',
  'who',
  'whom',
  'why',
  'with',
  'you',
  'your',
  'yours',
  'yourself',
  'yourselves',
  // Conversational & gaming boilerplate fillers
  'game',
  'games',
  'gaming',
  'gamer',
  'play',
  'played',
  'playing',
  'player',
  'recommend',
  'recommendation',
  'recommendations',
  'suggest',
  'suggestion',
  'suggestions',
  'looking',
  'look',
  'looks',
  'find',
  'show',
  'give',
  'tell',
  'want',
  'wanted',
  'wants',
  'like',
  'liked',
  'likes',
  'something',
  'good',
  'best',
  'nice',
  'cool',
  'please',
  'hi',
  'hello',
  'hey',
  'yo',
  'sup',
  'thanks',
  'thank',
  'buy',
  'bought',
  'get',
  'got',
  'help',
  'assist',
  'assistant',
  'hathor',
]);

/**
 * Extracts meaningful keyword tokens from text, omitting stopwords and short tokens.
 */
export function extractMeaningfulKeywords(text: string): string[] {
  const normalized = (text || '').toLowerCase().replace(/[^a-z0-9\s]/g, ' ');
  const tokens = normalized.split(/\s+/).filter(Boolean);
  return tokens.filter((t) => !STOP_WORDS.has(t) && t.length > 2);
}

/**
 * Checks if the user is asking for recommendations based on their own library/history.
 */
export function isLibraryRecommendationIntent(text?: string): boolean {
  if (!text) return false;
  const t = text.toLowerCase();
  return (
    t.includes('what i play') ||
    t.includes('like i play') ||
    t.includes('games i play') ||
    t.includes('my library') ||
    t.includes('my games') ||
    t.includes('games i own') ||
    t.includes('what i own') ||
    t.includes('based on my') ||
    t.includes('like my games')
  );
}

/**
 * Checks if a message is purely a casual greeting or conversational query without game discovery intent.
 */
export function isCasualGreetingOrChat(text?: string): boolean {
  if (!text) return false;
  const clean = text
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, '');
  const greetings = [
    'hi',
    'hello',
    'hey',
    'yo',
    'sup',
    'greetings',
    'good morning',
    'good evening',
    'good afternoon',
    'how are you',
    'who are you',
    'what are you',
    'what can you do',
    'help',
    'test',
    'thank you',
    'thanks',
  ];
  return greetings.includes(clean);
}

/**
 * Computes cosine similarity between two vector embeddings
 */
export function computeCosineSimilarity(vecA: number[], vecB: number[]): number {
  if (!vecA || !vecB || vecA.length !== vecB.length || vecA.length === 0) {
    return 0;
  }
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;
  for (let i = 0; i < vecA.length; i++) {
    dotProduct += vecA[i] * vecB[i];
    normA += vecA[i] * vecA[i];
    normB += vecB[i] * vecB[i];
  }
  if (normA === 0 || normB === 0) return 0;
  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}

/**
 * Creates SHA-256 content hash of game textual metadata
 */
export function computeContentHash(title: string, shortDesc: string, fullDesc: string): string {
  return createHash('sha256').update(`${title}:${shortDesc}:${fullDesc}`).digest('hex');
}

/**
 * Calls Google Gemini API to generate embedding for query text
 */
export async function generateEmbedding(
  text: string,
  apiKeyOverride?: string
): Promise<number[] | null> {
  const apiKey = apiKeyOverride || process.env.GEMINI_API_KEY;
  if (!apiKey) return null;

  const modelsToTry = ['gemini-embedding-001', 'text-embedding-004', 'gemini-embedding-2'];

  for (const model of modelsToTry) {
    try {
      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${model}:embedContent?key=${apiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            content: { parts: [{ text }] },
          }),
        }
      );

      if (!res.ok) continue;
      const data = (await res.json()) as { embedding?: { values?: number[] } };
      if (data?.embedding?.values) {
        return data.embedding.values;
      }
    } catch {
      // Try next model
    }
  }

  return null;
}

/**
 * Helper: fetch with timeout using AbortController
 */
async function fetchWithTimeout(
  url: string,
  options: any = {},
  timeoutMs = 8000
): Promise<Response> {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, { signal: controller.signal, ...options });
    return res;
  } finally {
    clearTimeout(id);
  }
}

/**
 * Helper: attempt fetch with a small retry/backoff policy
 */
async function tryFetchWithRetries(
  url: string,
  options: any = {},
  timeoutMs = 8000,
  retries = 2,
  backoffMs = 500
): Promise<Response> {
  let lastErr: any = null;
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      return await fetchWithTimeout(url, options, timeoutMs);
    } catch (err) {
      lastErr = err;
      if (attempt < retries) {
        await new Promise((r) => setTimeout(r, backoffMs * (attempt + 1)));
      }
    }
  }
  throw lastErr;
}

/**
 * Generates direct LLM response via Google Gemini API with smart intent classification
 */
export async function generateGeminiFlashResponse(
  prompt: string,
  candidateGames: Array<{
    gameId: string;
    title: string;
    shortDescription: string;
    priceEgp: string;
    reason?: string;
  }>,
  ownedGamesSummary?: string,
  chatHistory: Array<{ sender: string; text: string }> = [],
  apiKeyOverride?: string
): Promise<GeminiFlashResponse | null> {
  const apiKey = apiKeyOverride || process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.warn('[AI Service] No GEMINI_API_KEY provided; skipping Gemini direct responses.');
    return null;
  }

  try {
    const candidateListStr =
      candidateGames.length > 0
        ? candidateGames
            .map(
              (g) =>
                `- ID: ${g.gameId} | Title: "${g.title}" | Price: ${g.priceEgp} EGP | Summary: ${g.shortDescription}`
            )
            .join('\n')
        : '(No direct catalog candidates)';

    const historyStr =
      chatHistory.length > 0
        ? chatHistory
            .slice(-6)
            .map((m) => `${m.sender === 'user' ? 'User' : 'Assistant'}: ${m.text}`)
            .join('\n')
        : '(No prior messages)';

    const systemPrompt = `You are Hathor Assistant, the intelligent AI assistant for Hathor—a modern digital video game store and platform.

Store & Catalog Context:
- Hathor is a digital PC gaming store with games in various genres (Cyberpunk, Action, RPG, Stealth, Space Sim, Strategy, Roguelike, Racing, Puzzle).
- Prices are displayed in EGP (Egyptian Pounds).

Recent Conversation History:
${historyStr}

User Input: "${prompt}"
User's Owned Library: ${ownedGamesSummary || 'None (Guest user or empty library)'}

Available Catalog Candidates:
${candidateListStr}

Behavioral Guidelines & Rules:
1. Intent Classification:
   - Determine whether the user is actively asking for game recommendations / discovering games / inquiring about game genres ("isRecommendation": true).
   - OR if the user is simply chatting, greeting (e.g. "hi", "hello"), thanking, asking general platform questions, or having a casual conversation ("isRecommendation": false).

2. Casual Conversation & Greetings:
   - If the user is just saying hello, asking general questions, or chatting ("isRecommendation": false):
     - Set "isRecommendation": false
     - Set "recommendedGameIds": [] (MUST BE EMPTY ARRAY - do not attach any game cards).
     - Set "reply": A friendly, natural, and helpful greeting or conversational answer.

3. Library-Based Recommendations ("games like what I play", "based on my games"):
   - If the user asks for recommendations based on their library/play history:
     - If the User's Owned Library is empty or "None":
       - Set "isRecommendation": false
       - Set "recommendedGameIds": [] (MUST BE EMPTY ARRAY).
       - Set "reply": Explain politely that you don't have any record of games in their library yet, and invite them to share their favorite genres or game styles (e.g. Cyberpunk, Stealth, RPG, Space Sim) so you can recommend great titles for them.
     - If the user DOES have games in their library:
       - Set "isRecommendation": true
       - Pick relevant unowned candidate games that match the themes/genres of what they own.
       - Explain how each recommendation connects to what they own.

4. Specific Game Search & Recommendations:
   - If the user is looking for games:
     - Select ONLY the candidate games that genuinely fit the user's request.
     - Do NOT select games that do not fit. Return 1, 2, 3, etc. depending on true relevance. If only 1 game matches, return only 1. If none match well, return [].
     - "isRecommendation": true
     - "recommendedGameIds": ["id1", "id2"] (Array of selected game IDs from candidate list)
     - "gameReasons": { "id1": "Concise 1-sentence tailored explanation why this game fits..." }
     - "reply": A natural, engaging conversational response discussing your recommendations.

Respond STRICTLY in JSON format:
{
  "reply": "Conversational reply text",
  "isRecommendation": true,
  "recommendedGameIds": ["matching-game-id-1"],
  "gameReasons": {
    "matching-game-id-1": "Why this game fits"
  }
}`;

    const modelsToTry = [
      'gemini-2.5-flash',
      'gemini-1.5-flash',
      'gemini-1.5-flash-latest',
      'gemini-2.0-flash',
    ];

    for (const model of modelsToTry) {
      try {
        let res = await tryFetchWithRetries(
          `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [{ parts: [{ text: systemPrompt }] }],
              generationConfig: { responseMimeType: 'application/json', temperature: 0.7 },
            }),
          },
          8000,
          2,
          500
        );

        if (!res.ok) {
          // Retry without responseMimeType if model doesn't support json mode directly
          try {
            res = await tryFetchWithRetries(
              `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
              {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  contents: [{ parts: [{ text: systemPrompt }] }],
                  generationConfig: { temperature: 0.7 },
                }),
              },
              8000,
              1,
              500
            );
          } catch (e) {
            console.warn(`[AI Service] Gemini fetch retry error for ${model}:`, e);
            continue;
          }
        }

        if (!res.ok) {
          console.warn(`[AI Service] Gemini API (${model}) returned HTTP status:`, res.status);
          continue;
        }

        const data = (await res.json()) as any;
        const textOutput = data?.candidates?.[0]?.content?.parts?.[0]?.text;
        if (!textOutput) {
          console.warn('[AI Service] Gemini returned no text candidate for model', model);
          continue;
        }

        let cleanJsonStr = textOutput.trim();
        if (cleanJsonStr.startsWith('```json')) {
          cleanJsonStr = cleanJsonStr.replace(/^```json\s*/i, '').replace(/\s*```$/, '');
        } else if (cleanJsonStr.startsWith('```')) {
          cleanJsonStr = cleanJsonStr.replace(/^```\s*/, '').replace(/\s*```$/, '');
        }

        try {
          const parsed = JSON.parse(cleanJsonStr);
          return {
            reply: parsed.reply || cleanJsonStr,
            isRecommendation: parsed.isRecommendation !== false,
            recommendedGameIds: Array.isArray(parsed.recommendedGameIds)
              ? parsed.recommendedGameIds
              : [],
            gameReasons: parsed.gameReasons || {},
          };
        } catch {
          const jsonMatch = textOutput.match(/\{[\s\S]*\}/);
          if (jsonMatch) {
            try {
              const parsed = JSON.parse(jsonMatch[0]);
              return {
                reply: parsed.reply || textOutput,
                isRecommendation: parsed.isRecommendation !== false,
                recommendedGameIds: Array.isArray(parsed.recommendedGameIds)
                  ? parsed.recommendedGameIds
                  : [],
                gameReasons: parsed.gameReasons || {},
              };
            } catch {
              // Fallback below
            }
          }

          return {
            reply: textOutput.trim(),
            isRecommendation: false,
            recommendedGameIds: [],
            gameReasons: {},
          };
        }
      } catch (innerErr) {
        console.warn(`[AI Service] Error attempting Gemini model ${model}:`, innerErr);
      }
    }

    return null;
  } catch (err) {
    console.error('[AI Service] Gemini generation error:', err);
    return null;
  }
}

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
  console.log('[AI Service] Executing Dynamic Keyword Fallback for prompt:', prompt || '(none)');

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

/**
 * Core Hybrid RAG + Direct LLM Discovery Assistant logic with Library Awareness
 */
export async function getHybridRecommendations(
  prompt?: string,
  contextGameId?: string,
  ownedGameIds: string[] = [],
  limit = 6,
  chatHistory: Array<{ sender: string; text: string }> = [],
  apiKeyOverride?: string
): Promise<RecommendationResult> {
  const effectiveGeminiKey = apiKeyOverride || process.env.GEMINI_API_KEY;
  const rawPrompt = (prompt || '').trim();

  console.log('[AI Service] Incoming recommendation request:', {
    prompt: rawPrompt || '(none)',
    contextGameId,
    ownedGameCount: ownedGameIds.length,
    hasGeminiKey: !!effectiveGeminiKey,
  });

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
      try {
        const queryVector = await generateEmbedding(vectorQueryText, effectiveGeminiKey);

        if (queryVector) {
          console.log(
            '[AI Service] Executing Cosine Similarity Vector Search for query:',
            vectorQueryText
          );
          const storedEmbeddings = await catalogDb.select().from(gameEmbeddings);

          if (storedEmbeddings.length > 0) {
            const scoredGames = storedEmbeddings
              .map((row: typeof gameEmbeddings.$inferSelect) => ({
                gameId: row.gameId,
                score: computeCosineSimilarity(queryVector, row.embedding as number[]),
              }))
              .filter((sg: { gameId: string; score: number }) => {
                if (contextGameId && sg.gameId === contextGameId) return false;
                if (ownedSet.has(sg.gameId)) return false;
                return sg.score > 0.25; // Relevance threshold
              })
              .sort((a, b) => b.score - a.score)
              .slice(0, 10); // Pass top 10 candidates to Gemini for evaluation

            if (scoredGames.length > 0) {
              const topGameIds = scoredGames.map((sg) => sg.gameId);
              const matchedGames = await catalogDb
                .select()
                .from(games)
                .where(and(eq(games.status, 'published'), inArray(games.id, topGameIds)));

              const scoreMap = new Map(scoredGames.map((sg) => [sg.gameId, sg.score]));

              candidateItems = matchedGames.map((g) => {
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

              candidateSource = 'rag';
            }
          }
        }
      } catch (vectorErr) {
        console.warn('[AI Service] Vector search error:', vectorErr);
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

    // If still empty and Gemini is active, let's load all published unowned games as candidate options so Gemini can evaluate
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
      console.log('[AI Service] Invoking Gemini API for conversational response & selection...');

      const geminiResult = await generateGeminiFlashResponse(
        rawPrompt,
        candidateItems,
        ownedSummaryStr,
        chatHistory,
        effectiveGeminiKey
      );

      if (geminiResult) {
        console.log('[AI Service] Gemini response received:', {
          isRecommendation: geminiResult.isRecommendation,
          recommendedCount: geminiResult.recommendedGameIds.length,
        });

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
