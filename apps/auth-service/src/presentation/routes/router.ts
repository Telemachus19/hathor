import { Router } from 'express';
import { TurnstileVerifier } from '../../domain/turnstile.js';
import { createUserRouter } from './user.js';
import { createInternalRouter } from './internal.js';

export function createApiRouter(turnstileVerifier: TurnstileVerifier): Router {
  const router = Router();

  // Mount resources
  router.use('/', createUserRouter(turnstileVerifier));
  router.use('/internal/v1/auth', createInternalRouter());

  return router;
}
