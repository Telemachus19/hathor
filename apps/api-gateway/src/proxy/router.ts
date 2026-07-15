import { Router, Request, Response } from 'express';
import { createProxyMiddleware } from 'http-proxy-middleware';

const AUTH_SERVICE_URL = process.env.AUTH_SERVICE_URL || 'http://localhost:5001';
const CATALOG_SERVICE_URL = process.env.CATALOG_SERVICE_URL || 'http://localhost:5002';
const COMMERCE_SERVICE_URL = process.env.COMMERCE_SERVICE_URL || 'http://localhost:5003';
const LIBRARY_SERVICE_URL = process.env.LIBRARY_SERVICE_URL || 'http://localhost:5004';

function handleProxyError(err: any, req: any, res: any) {
  if (res.headersSent) return;
  res.status(503).json({
    success: false,
    error: {
      code: 'PROXY_ERROR',
      message: 'Target microservice is unavailable',
      status: 503,
      timestamp: new Date().toISOString(),
    },
  });
}

const userProxy = createProxyMiddleware({
  target: AUTH_SERVICE_URL,
  changeOrigin: true,
  on: {
    error: handleProxyError,
  },
});

const storeProxy = createProxyMiddleware({
  target: CATALOG_SERVICE_URL,
  changeOrigin: true,
  on: {
    error: handleProxyError,
  },
});

const txnProxy = createProxyMiddleware({
  target: COMMERCE_SERVICE_URL,
  changeOrigin: true,
  on: {
    error: handleProxyError,
  },
});

const inventoryProxy = createProxyMiddleware({
  target: LIBRARY_SERVICE_URL,
  changeOrigin: true,
  on: {
    error: handleProxyError,
  },
});

export const proxyRouter: Router = Router();

proxyRouter.use('/user', userProxy);
proxyRouter.use('/store', storeProxy);
proxyRouter.use('/txn', txnProxy);
proxyRouter.use('/inventory', inventoryProxy);
