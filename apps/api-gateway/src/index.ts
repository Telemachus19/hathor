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

// 4. API v1 Health Router
const apiV1Router: Router = express.Router();

apiV1Router.get('/health', (req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    data: {
      status: 'healthy',
      service: 'api-gateway',
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || 'development',
      timestamp: new Date().toISOString(),
      routes: {
        user: process.env.AUTH_SERVICE_URL || 'http://localhost:5001',
        store: process.env.CATALOG_SERVICE_URL || 'http://localhost:5002',
        txn: process.env.COMMERCE_SERVICE_URL || 'http://localhost:5003',
        inventory: process.env.LIBRARY_SERVICE_URL || 'http://localhost:5004',
      },
    },
  });
});

// 5. Attach Proxy Sub-Router
apiV1Router.use('/', proxyRouter);

// 6. Mount Gateway v1 Namespace
app.use('/api/v1', apiV1Router);

// 7. Global Uniform Error Handler
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Hathor API Gateway running on http://localhost:${PORT}/api/v1`);
});
