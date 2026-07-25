import { Router } from 'express';
import { createProxyMiddleware, Options } from 'http-proxy-middleware';

// ---------------------------------------------------------------------------
// Downstream service URLs
// ---------------------------------------------------------------------------
const AUTH_SERVICE_URL = process.env.AUTH_SERVICE_URL || 'http://localhost:5001';
const CATALOG_SERVICE_URL = process.env.CATALOG_SERVICE_URL || 'http://localhost:5002';
const COMMERCE_SERVICE_URL = process.env.COMMERCE_SERVICE_URL || 'http://localhost:5003';
const LIBRARY_SERVICE_URL = process.env.LIBRARY_SERVICE_URL || 'http://localhost:5004';

// ---------------------------------------------------------------------------
// Shared proxy configuration
// ---------------------------------------------------------------------------
const PROXY_TIMEOUT_MS = 30_000; // 30 seconds

/**
 * Proxy error handler that returns the standard error model per service-contracts.md.
 * Read correlationId from req (set by correlationId middleware upstream).
 */
function handleProxyError(err: any, req: any, res: any) {
  if (res.headersSent) return;
  const correlationId = req.correlationId || req.headers?.['x-correlation-id'] || 'unknown';
  res.status(503).json({
    error: {
      code: 'DEPENDENCY_UNAVAILABLE',
      message: 'Target microservice is unavailable',
      correlationId,
    },
  });
}

/**
 * Creates a proxy middleware instance with pathFilter matching the specified routes.
 * Preserves the OpenAPI contract path (e.g. /user/register, /store/apps) when
 * forwarding to downstream services so services can mount contract-matching routes.
 */
function createServiceProxy(
  target: string,
  pathFilter: string[]
): ReturnType<typeof createProxyMiddleware> {
  return createProxyMiddleware({
    target,
    pathFilter,
    changeOrigin: true,
    timeout: PROXY_TIMEOUT_MS,
    proxyTimeout: PROXY_TIMEOUT_MS,
    on: {
      error: handleProxyError,
      proxyReq: (proxyReq, req: any) => {
        // Forward correlation ID to downstream service
        if (req.correlationId) {
          proxyReq.setHeader('x-correlation-id', req.correlationId);
        }
      },
    },
  } satisfies Options);
}

// ---------------------------------------------------------------------------
// Route mapping — matches canonical public-api OpenAPI contract namespaces:
//
//   /user/*, /admin/users/*             → Auth Service
//   /store/*, /creator/*, /admin/games/* → Catalog Service
//   /cart/*, /txn/*, /admin/transactions/* → Commerce Service
//   /inventory/*                        → Library Service
// ---------------------------------------------------------------------------
export const proxyRouter: Router = Router();

// Auth Service proxy
proxyRouter.use(createServiceProxy(AUTH_SERVICE_URL, ['/user', '/admin/users']));

// Catalog Service proxy
proxyRouter.use(createServiceProxy(CATALOG_SERVICE_URL, ['/store', '/creator', '/admin/games']));

// Commerce Service proxy
proxyRouter.use(createServiceProxy(COMMERCE_SERVICE_URL, ['/cart', '/txn', '/admin/transactions']));

// Library Service proxy
proxyRouter.use(createServiceProxy(LIBRARY_SERVICE_URL, ['/inventory']));
