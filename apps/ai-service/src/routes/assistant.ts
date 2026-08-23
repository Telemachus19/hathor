import { Router, Request, Response } from 'express';
import { getHybridRecommendations } from '../services/ragService.js';

export const assistantRouter: Router = Router();

const handleRecommendations = async (req: Request, res: Response) => {
  try {
    const isPost = req.method === 'POST';
    const body = isPost ? req.body || {} : {};
    const query = req.query || {};

    const gameId = (body.gameId || query.gameId) as string | undefined;
    const prompt = (body.prompt || query.prompt) as string | undefined;
    const limit = Math.min(20, Math.max(1, parseInt((body.limit || query.limit) as string) || 6));
    const chatHistory = Array.isArray(body.chatHistory) ? body.chatHistory : [];

    const customApiKey = (body.geminiApiKey || req.headers['x-gemini-api-key']) as
      string | undefined;

    const rawOwned = isPost ? body.ownedGameIds : query.ownedGameIds;
    let ownedGameIds: string[] = [];
    if (typeof rawOwned === 'string') {
      ownedGameIds = rawOwned
        .split(',')
        .map((id: string) => id.trim())
        .filter(Boolean);
    } else if (Array.isArray(rawOwned)) {
      ownedGameIds = rawOwned.map((id: any) => String(id).trim()).filter(Boolean);
    }

    const result = await getHybridRecommendations(
      prompt,
      gameId,
      ownedGameIds,
      limit,
      chatHistory,
      customApiKey
    );

    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error('[AI Service] Error handling recommendations/chat request:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'AI_SERVICE_ERROR',
        message: 'Failed to process AI assistant request',
      },
    });
  }
};

// Mount recommendation handlers on assistant routes
assistantRouter.get('/recommendations', handleRecommendations);
assistantRouter.post('/recommendations', handleRecommendations);
assistantRouter.post('/chat', handleRecommendations);

// Aliases for compatibility
assistantRouter.get('/', handleRecommendations);
assistantRouter.post('/', handleRecommendations);
