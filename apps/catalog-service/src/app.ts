import cors from 'cors';
import express, { Request, Response, type Express } from 'express';

export type ReadinessCheck = () => Promise<void>;

export function createCatalogApp(checkDatabase: ReadinessCheck): Express {
  const app = express();

  app.use(cors());
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
