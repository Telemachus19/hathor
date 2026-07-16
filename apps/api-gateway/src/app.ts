import cors from 'cors';
import express, { Request, Response, Router, type Express } from 'express';
import helmet from 'helmet';
import { errorHandler } from './middleware/errorHandler.js';
import { rateLimiter } from './middleware/rateLimiter.js';
import { proxyRouter } from './proxy/router.js';

export function createGatewayApp(): Express {
  const app = express();
  const corsOrigin = process.env.CORS_ORIGIN || 'http://localhost:3000';

  app.use(helmet());
  app.use(
    cors({
      origin: corsOrigin,
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    })
  );
  app.use(rateLimiter);

  app.get('/health/live', (_req: Request, res: Response) => {
    res.status(200).json({
      success: true,
      data: {
        service: 'api-gateway',
        status: 'live',
        timestamp: new Date().toISOString(),
      },
    });
  });

  app.get('/health/ready', (_req: Request, res: Response) => {
    res.status(200).json({
      success: true,
      data: {
        service: 'api-gateway',
        status: 'ready',
        timestamp: new Date().toISOString(),
      },
    });
  });

  const apiV1Router: Router = express.Router();
  apiV1Router.use('/', proxyRouter);
  app.use('/api/v1', apiV1Router);
  app.use(errorHandler);

  return app;
}
