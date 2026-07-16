import express, { Request, Response, Router } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import * as dotenv from 'dotenv';
import { rateLimiter } from './middleware/rateLimiter.js';
import { errorHandler } from './middleware/errorHandler.js';
import { proxyRouter } from './proxy/router.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const CORS_ORIGIN = process.env.CORS_ORIGIN || 'http://localhost:3000';

// 1. HTTP Security Headers
app.use(helmet());

// 2. CORS Policy configuration
app.use(
  cors({
    origin: CORS_ORIGIN,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  })
);

// 3. Rate Limiter (Max 100 requests per 15-min window per IP)
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

// 4. API v1 Router
const apiV1Router: Router = express.Router();

// 5. Attach Proxy Sub-Router
apiV1Router.use('/', proxyRouter);

// 6. Mount Gateway v1 Namespace
app.use('/api/v1', apiV1Router);

// 7. Global Uniform Error Handler
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Hathor API Gateway running on http://localhost:${PORT}/api/v1`);
});
