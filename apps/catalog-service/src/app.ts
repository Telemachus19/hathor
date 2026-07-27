import cors from 'cors';
import express, { Request, Response, type Express } from 'express';

export type ReadinessCheck = () => Promise<void>;

export function createCatalogApp(checkDatabase: ReadinessCheck): Express {
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
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'X-Correlation-ID', 'Idempotency-Key'],
      exposedHeaders: ['X-Correlation-ID'],
    })
  );
  app.use(express.json());

  app.get('/health/live', (_req: Request, res: Response) => {
    res.status(200).json({
      success: true,
      data: {
        service: 'catalog-service',
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
          service: 'catalog-service',
          status: 'ready',
          timestamp: new Date().toISOString(),
          checks: { database: 'up' },
        },
      });
    } catch {
      res.status(503).json({
        success: false,
        error: { code: 'SERVICE_NOT_READY', message: 'Catalog service is not ready' },
      });
    }
  });

  return app;
}
