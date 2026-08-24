import type { ProviderGenerationResult } from '../types.js';

export async function generateWithGlm(
  apiKey: string,
  baseUrl: string,
  messages: Array<{ role: string; content: string }>,
  candidateModels: string[]
): Promise<ProviderGenerationResult> {
  if (!apiKey) {
    throw new Error('GLM API key is not configured. Please set GLM_API in .env.');
  }

  let lastError: any = null;

  for (const model of candidateModels) {
    try {
      const res = await fetch(`${baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': 'https://hathor.portal',
          'X-Title': 'Hathor Developer Portal',
        },
        body: JSON.stringify({
          model,
          response_format: { type: 'json_object' },
          messages,
          temperature: 0.7,
        }),
      });

      if (!res.ok) {
        const errBody = await res.text();
        if (res.status === 402) {
          throw new Error('GLM / OpenRouter requires credits (HTTP 402 Payment Required).');
        }
        if (res.status === 429) {
          console.warn(
            `[GLM 5.2 Agent] Model ${model} is rate-limited (HTTP 429). Retrying in 2s...`
          );
          await new Promise((r) => setTimeout(r, 2000));
          // One immediate retry on rate-limit
          const retryRes = await fetch(`${baseUrl}/chat/completions`, {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${apiKey}`,
              'Content-Type': 'application/json',
              'HTTP-Referer': 'https://hathor.portal',
              'X-Title': 'Hathor Developer Portal',
            },
            body: JSON.stringify({
              model,
              response_format: { type: 'json_object' },
              messages,
              temperature: 0.7,
            }),
          });
          if (retryRes.ok) {
            const retryData = (await retryRes.json()) as any;
            const text = retryData.choices?.[0]?.message?.content || '';
            if (text) return { text, modelUsed: model };
          }
        }
        throw new Error(`GLM HTTP ${res.status}: ${errBody}`);
      }

      const data = (await res.json()) as any;
      const text = data.choices?.[0]?.message?.content || '';
      if (!text) {
        throw new Error('Empty response content received from GLM.');
      }

      return { text, modelUsed: model };
    } catch (err: any) {
      lastError = err;
      console.warn(`[GLM 5.2 Agent] Model ${model} failed (${err.message}). Trying next...`);
      continue;
    }
  }

  throw lastError || new Error('All GLM candidate models failed.');
}
