import { createHash } from 'crypto';

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
