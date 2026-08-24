import { GoogleGenAI } from '@google/genai';
import type { ProviderGenerationResult } from '../types.js';

export async function generateWithGemini(
  ai: GoogleGenAI | null,
  contents: any[],
  systemInstruction: string,
  candidateModels: string[]
): Promise<ProviderGenerationResult> {
  if (!ai) {
    throw new Error('Gemini API is not configured. Please set GEMINI_API in .env.');
  }

  let lastError: any = null;

  for (const model of candidateModels) {
    try {
      const response = await ai.models.generateContent({
        model,
        contents,
        config: {
          systemInstruction,
          responseMimeType: 'application/json',
          temperature: 0.7,
        },
      });

      const candidate = response.candidates?.[0];
      const text = candidate?.content?.parts?.find((p: any) => p.text)?.text || '';
      if (!text) {
        throw new Error('Empty response received from Gemini.');
      }

      return { text, modelUsed: model };
    } catch (err: any) {
      lastError = err;
      console.warn(`[Gemini Agent] Model ${model} failed (${err.message}). Trying next...`);
      continue;
    }
  }

  throw lastError || new Error('All Gemini candidate models failed.');
}
