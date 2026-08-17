import { Router } from 'express';
import { serviceTokensHandler } from './internal/service-tokens.js';
import { auditLogsHandler } from './internal/audit-logs.js';

export function createInternalRouter(): Router {
  const router = Router();

  router.post('/service-tokens', serviceTokensHandler);
  router.get('/audit-logs', auditLogsHandler);

  return router;
}
