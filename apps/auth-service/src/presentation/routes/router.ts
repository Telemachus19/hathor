import { Router } from 'express';
import { TurnstileVerifier } from '../../domain/turnstile.js';
import { createUserRouter } from './user.js';

export function createApiRouter(turnstileVerifier: TurnstileVerifier): Router {
  const router = Router();

  // Mount resources
  router.use('/', createUserRouter(turnstileVerifier));

  return router;
}
