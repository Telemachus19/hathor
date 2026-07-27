import './types.js'; // Express Request augmentation — must be imported first

import cors from 'cors';
import express, { Request, Response, Router, type Express } from 'express';
import helmet from 'helmet';
import { correlationId } from './middleware/correlationId.js';
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js';
import { internalPathBlocker } from './middleware/internalPathBlocker.js';
import { authRateLimiter, globalRateLimiter } from './middleware/rateLimiter.js';
import { proxyRouter } from './proxy/router.js';

export function createGatewayApp(): Express {
  const app = express();
  const corsOrigin = process.env.CORS_ORIGIN || 'http://localhost:3000';

  // ---------------------------------------------------------------------------
  // 1. Correlation ID — must run first so every subsequent middleware and
  //    error response can reference req.correlationId
  // ---------------------------------------------------------------------------
  app.use(correlationId);

  // ---------------------------------------------------------------------------
  // 2. Security headers — Helmet with explicit CSP directives
  // ---------------------------------------------------------------------------
  app.use(
    helmet({
      // Block framing entirely (clickjacking defense)
      frameguard: { action: 'deny' },
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          scriptSrc: ["'self'"],
          styleSrc: ["'self'", "'unsafe-inline'"],
          imgSrc: ["'self'", 'data:'],
          fontSrc: ["'self'"],
          objectSrc: ["'none'"], // Block <object>, <embed>, <applet>
          baseUri: ["'self'"], // Prevent <base> tag injection
          formAction: ["'self'"],
          frameAncestors: ["'none'"], // CSP-level frame blocking
        },
      },
    })
  );

  // ---------------------------------------------------------------------------
  // 3. CORS — strict origin with credentials, expose correlation header
  // ---------------------------------------------------------------------------
  app.use(
    cors({
      origin: (origin, callback) => {
        // Allow requests with no Origin header (e.g. same-origin, server-to-server, health checks)
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

  // ---------------------------------------------------------------------------
  // 4. Global rate limiter (all routes)
  // ---------------------------------------------------------------------------
  app.use(globalRateLimiter);

  // ---------------------------------------------------------------------------
  // 5. Health probes — before API routes, lightweight and idempotent
  // ---------------------------------------------------------------------------
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

  // ---------------------------------------------------------------------------
  // 6. API v1 routes
  //
  //    IMPORTANT: express.json() is NOT registered globally. The proxy
  //    middleware requires the raw request stream to forward bodies to
  //    downstream services. If express.json() consumed the body first,
  //    proxied POST/PUT/PATCH requests with JSON bodies would break.
  //
  //    Body-size enforcement for proxied routes is handled per-service
  //    by the downstream services themselves. The gateway only needs
  //    express.json() for its own directly-handled routes (health, 404),
  //    which are bodyless GET endpoints.
  // ---------------------------------------------------------------------------
  const apiV1Router: Router = express.Router();

  // Block /internal/* before any proxy can be reached
  apiV1Router.use(internalPathBlocker);

  // Stricter rate limit on auth endpoints
  apiV1Router.use('/user/register', authRateLimiter);
  apiV1Router.use('/user/login', authRateLimiter);

  // Proxy routes — body forwarding is handled by http-proxy-middleware
  apiV1Router.use('/', proxyRouter);

  app.use('/api/v1', apiV1Router);

  // ---------------------------------------------------------------------------
  // 7. Catch-all 404 + error handler (must be last)
  // ---------------------------------------------------------------------------
  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
