import cors from 'cors';
import express, { Request, Response, type Express } from 'express';
import { assistantRouter } from './routes/assistant.js';
import { designerChatRouter } from './routes/designerChat.js';

export type ReadinessCheck = () => Promise<void>;

export function createAIApp(checkDatabase: ReadinessCheck): Express {
  const app = express();

  const corsOrigin = process.env.CORS_ORIGIN || process.env.FRONTEND_URL || 'http://localhost:3000';
  app.use(
    cors({
      origin: (origin, callback) => {
        if (!origin || origin === corsOrigin || origin.startsWith('http://localhost:')) {
          callback(null, true);
        } else {
          callback(null, false);
        }
      },
      credentials: true,
      exposedHeaders: ['X-Correlation-ID'],
    })
  );
  app.use(express.json());

  // Mount Agentic AI Designer Chat Routes
  app.use('/ai', designerChatRouter);
  app.use('/creator', designerChatRouter);

  // Mount Assistant & RAG Recommendation Routes
  app.use('/assistant', assistantRouter);
  app.use('/ai', assistantRouter);
  app.use('/store', assistantRouter); // For direct backward-compatibility

  // Health Probes
  app.get('/health/live', (_req: Request, res: Response) => {
    res.status(200).json({
      success: true,
      data: {
        service: 'ai-service',
        status: 'live',
        timestamp: new Date().toISOString(),
      },
    });
  });

  app.get('/health/ready', async (_req: Request, res: Response) => {
    try {
      await checkDatabase();
      res.status(200).json({
        success: true,
        data: {
          service: 'ai-service',
          status: 'ready',
          timestamp: new Date().toISOString(),
          checks: { database: 'up' },
        },
      });
    } catch {
      res.status(503).json({
        success: false,
        error: { code: 'SERVICE_NOT_READY', message: 'AI service database is not ready' },
      });
    }
  });

  return app;
}
