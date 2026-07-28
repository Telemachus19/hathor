import { Router } from 'express';
import { TurnstileVerifier } from '../../domain/turnstile.js';
import { createUserRouter } from './user.js';
import { createInternalRouter } from './internal.js';

export function createApiRouter(turnstileVerifier: TurnstileVerifier): Router {
  const router = Router();

  // Mount resources
  const userRouter = createUserRouter(turnstileVerifier);
  router.use('/user', userRouter);
  router.use('/', userRouter);
  router.use('/internal/v1/auth', createInternalRouter());

  return router;
}
