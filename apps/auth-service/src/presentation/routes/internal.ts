import { Router } from 'express';
import { serviceTokensHandler } from './internal/service-tokens.js';

export function createInternalRouter(): Router {
  const router = Router();

  router.post('/service-tokens', serviceTokensHandler);

  return router;
}
