import cors from 'cors';
import express, { Request, Response, type Express } from 'express';
import cookieParser from 'cookie-parser';
import { TurnstileVerifier } from './domain/turnstile.js';
import { FakeTurnstileVerifier } from './infrastructure/turnstile/fake.js';
import { createApiRouter } from './presentation/routes/router.js';

export type ReadinessCheck = () => Promise<void>;

export function createAuthApp(
  checkDatabase: ReadinessCheck,
  turnstileVerifier: TurnstileVerifier = new FakeTurnstileVerifier()
): Express {
  const app = express();

  app.use(cors());
  app.use(express.json());
  app.use(cookieParser());

  // Mount presentation API router at the root
  app.use('/', createApiRouter(turnstileVerifier));

  app.get('/health/live', (_req: Request, res: Response) => {
    res.status(200).json({
      success: true,
      data: {
        service: 'auth-service',
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
          service: 'auth-service',
          status: 'ready',
          timestamp: new Date().toISOString(),
          checks: { database: 'up' },
        },
      });
    } catch {
      res.status(503).json({
        success: false,
        error: { code: 'SERVICE_NOT_READY', message: 'Auth service is not ready' },
      });
    }
  });

  return app;
}
