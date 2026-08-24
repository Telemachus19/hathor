import type { GeminiFlashResponse, CandidateGame, ChatMessage } from './types.js';

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
  candidateGames: CandidateGame[],
  ownedGamesSummary?: string,
  chatHistory: ChatMessage[] = [],
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
