import request from 'supertest';
import { describe, expect, it } from 'vitest';
import { createAIApp } from '../../../apps/ai-service/src/app.js';
import {
  computeCosineSimilarity,
  extractMeaningfulKeywords,
  isCasualGreetingOrChat,
  isLibraryRecommendationIntent,
  STOP_WORDS,
} from '../../../apps/ai-service/src/services/ragService.js';
import { withCorrelationId } from '../src/index.js';

const ready = async () => undefined;
const app = createAIApp(ready);

describe('AI & Assistant Service Test Suite', () => {
  describe('Health Probes', () => {
    it('GET /health/live returns 200 with service metadata', async () => {
      const { headers } = withCorrelationId();
      const res = await request(app).get('/health/live').set(headers);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toMatchObject({
        service: 'ai-service',
        status: 'live',
      });
      expect(res.body.data.timestamp).toBeDefined();
    });

    it('GET /health/ready returns 200 when database readiness check passes', async () => {
      const { headers } = withCorrelationId();
      const res = await request(app).get('/health/ready').set(headers);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toMatchObject({
        service: 'ai-service',
        status: 'ready',
        checks: { database: 'up' },
      });
    });

    it('GET /health/ready returns 503 SERVICE_NOT_READY when database check fails', async () => {
      const failingApp = createAIApp(async () => {
        throw new Error('Database connection timed out');
      });

      const res = await request(failingApp).get('/health/ready');
      expect(res.status).toBe(503);
      expect(res.body.success).toBe(false);
      expect(res.body.error).toMatchObject({
        code: 'SERVICE_NOT_READY',
        message: 'AI service database is not ready',
      });
    });
  });

  describe('CORS and Correlation ID handling', () => {
    it('exposes X-Correlation-ID in response headers', async () => {
      const { correlationId, headers } = withCorrelationId();
      const res = await request(app).get('/health/live').set(headers);

      expect(res.status).toBe(200);
      expect(res.headers['access-control-expose-headers']).toContain('X-Correlation-ID');
    });

    it('allows requests with standard localhost origin', async () => {
      const res = await request(app).get('/health/live').set('Origin', 'http://localhost:3000');

      expect(res.status).toBe(200);
      expect(res.headers['access-control-allow-origin']).toBe('http://localhost:3000');
    });
  });

  describe('Keyword Extraction & Intent Helpers', () => {
    it('removes stop words and short tokens from query text', () => {
      const keywords = extractMeaningfulKeywords(
        'I want to find a cool cyberpunk RPG game with stealth'
      );
      expect(keywords).toContain('cyberpunk');
      expect(keywords).toContain('rpg');
      expect(keywords).toContain('stealth');
      expect(keywords).not.toContain('want');
      expect(keywords).not.toContain('game');
      expect(keywords).not.toContain('with');
    });

    it('detects library recommendation intent', () => {
      expect(isLibraryRecommendationIntent('Recommend something based on what I play')).toBe(true);
      expect(isLibraryRecommendationIntent('Based on games in my library')).toBe(true);
      expect(isLibraryRecommendationIntent('Show me cyberpunk games')).toBe(false);
      expect(isLibraryRecommendationIntent()).toBe(false);
    });

    it('detects casual greetings and chit-chat', () => {
      expect(isCasualGreetingOrChat('hello')).toBe(true);
      expect(isCasualGreetingOrChat('hi')).toBe(true);
      expect(isCasualGreetingOrChat('how are you')).toBe(true);
      expect(isCasualGreetingOrChat('thank you')).toBe(true);
      expect(isCasualGreetingOrChat('recommend dark fantasy rpg with open world')).toBe(false);
      expect(isCasualGreetingOrChat('')).toBe(false);
    });

    it('computes cosine similarity accurately', () => {
      // Identical vectors -> similarity 1
      expect(computeCosineSimilarity([1, 0, 0], [1, 0, 0])).toBeCloseTo(1.0);
      // Orthogonal vectors -> similarity 0
      expect(computeCosineSimilarity([1, 0, 0], [0, 1, 0])).toBeCloseTo(0.0);
      // Opposite vectors -> similarity -1
      expect(computeCosineSimilarity([1, 0], [-1, 0])).toBeCloseTo(-1.0);
      // Handles invalid inputs safely
      expect(computeCosineSimilarity([], [])).toBe(0);
      expect(computeCosineSimilarity([1, 2], [1])).toBe(0);
    });

    it('maintains expected stop words dictionary', () => {
      expect(STOP_WORDS.has('game')).toBe(true);
      expect(STOP_WORDS.has('recommend')).toBe(true);
      expect(STOP_WORDS.has('assistant')).toBe(true);
      expect(STOP_WORDS.has('the')).toBe(true);
    });
  });

  describe('Assistant & Recommendation Endpoints', () => {
    it('GET /assistant/recommendations handles casual greeting without failing', async () => {
      const res = await request(app).get('/assistant/recommendations?prompt=hello');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toBeDefined();
      expect(Array.isArray(res.body.data.items)).toBe(true);
      expect(res.body.data.conversationalReply).toBeDefined();
      expect(res.body.data.refreshedAt).toBeDefined();
    });

    it('POST /assistant/recommendations processes valid query payload', async () => {
      const res = await request(app)
        .post('/assistant/recommendations')
        .send({
          prompt: 'Fast paced racing action',
          limit: 4,
          ownedGameIds: ['00000000-0000-0000-0000-000000000001'],
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toBeDefined();
      expect(Array.isArray(res.body.data.items)).toBe(true);
      expect(res.body.data.refreshedAt).toBeDefined();
    });

    it('POST /assistant/chat handles conversation history input', async () => {
      const res = await request(app)
        .post('/assistant/chat')
        .send({
          prompt: 'Tell me about sci-fi games',
          chatHistory: [
            { role: 'user', content: 'Hi' },
            { role: 'assistant', content: 'Hello! What kind of games are you looking for?' },
          ],
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toBeDefined();
    });

    it('handles aliased routes /ai and /store for backward compatibility', async () => {
      const aiRes = await request(app).get('/ai/recommendations?prompt=strategy');
      expect(aiRes.status).toBe(200);
      expect(aiRes.body.success).toBe(true);

      const storeRes = await request(app).get('/store/recommendations?prompt=puzzle');
      expect(storeRes.status).toBe(200);
      expect(storeRes.body.success).toBe(true);
    });
  });
});
