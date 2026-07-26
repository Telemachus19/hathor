import { Router } from 'express';
import { TurnstileVerifier } from '../../domain/turnstile.js';
import { registerHandler } from './user/register.js';
import { loginHandler } from './user/login.js';
import { jwksHandler } from './user/jwks.js';

export function createUserRouter(turnstileVerifier: TurnstileVerifier): Router {
  const router = Router();

  router.post('/register', registerHandler(turnstileVerifier));
  router.post('/login', loginHandler);
  router.get('/.well-known/jwks.json', jwksHandler);

  return router;
}
