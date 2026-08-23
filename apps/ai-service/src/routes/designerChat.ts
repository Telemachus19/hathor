import { Router, Request, Response } from 'express';
import { aiThemeAgent } from '../services/ai/aiThemeAgent.js';
import { requireAuth, requireRole } from '../middleware/auth.js';

export const designerChatRouter: Router = Router();

/**
 * POST /ai/games/:gameId/designer-chat
 * POST /ai/creator/games/:gameId/agent-chat
 * Autonomous Agentic AI storefront theme generator with self-correction loop.
 */
const handleDesignerChat = async (req: Request, res: Response) => {
  const correlationId =
    (req.headers['x-correlation-id'] as string) || req.headers['correlation-id'] || '';

  try {
    const { gameId } = req.params;
    const { message, currentTheme, conversationHistory, provider, model } = req.body;

    if (!message || typeof message !== 'string' || !message.trim()) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'The "message" field is required and must be a non-empty string.',
          correlationId,
        },
      });
    }

    const authToken = req.headers.authorization;

    const result = await aiThemeAgent.handleChat({
      gameId: gameId || 'draft',
      message: message.trim(),
      currentTheme,
      conversationHistory: Array.isArray(conversationHistory) ? conversationHistory : [],
      provider,
      model,
      authToken,
    });

    return res.status(200).json({
      success: true,
      data: result,
      correlationId,
    });
  } catch (error: any) {
    console.error('[AI Service] Error in handleDesignerChat:', error);
    return res.status(500).json({
      success: false,
      error: {
        code: 'AI_SERVICE_ERROR',
        message: error.message || 'Internal server error while processing AI theme generation.',
        correlationId,
      },
    });
  }
};

// Mount routes with authentication for creators and admins
designerChatRouter.post('/games/:gameId/designer-chat', requireAuth, requireRole(['creator', 'admin']), handleDesignerChat);
designerChatRouter.post('/games/:gameId/ai/agent-chat', requireAuth, requireRole(['creator', 'admin']), handleDesignerChat);
designerChatRouter.post('/creator/games/:gameId/agent-chat', requireAuth, requireRole(['creator', 'admin']), handleDesignerChat);
designerChatRouter.post('/creator/games/:gameId/ai/agent-chat', requireAuth, requireRole(['creator', 'admin']), handleDesignerChat);
designerChatRouter.post('/designer-chat', requireAuth, requireRole(['creator', 'admin']), handleDesignerChat);
designerChatRouter.post('/', requireAuth, requireRole(['creator', 'admin']), handleDesignerChat);
