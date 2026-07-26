import { Router } from 'express';
import { TurnstileVerifier } from '../../domain/turnstile.js';
import { registerHandler } from './user/register.js';
import { loginHandler } from './user/login.js';
import { refreshHandler } from './user/refresh.js';
import { logoutHandler } from './user/logout.js';
import { jwksHandler } from './user/jwks.js';
import { meHandler } from './user/me.js';
import { passwordResetHandler } from './user/password-reset.js';
import { disableAccountHandler } from './user/disable.js';
import { requireAuth } from '../middlewares/auth.js';

export function createUserRouter(turnstileVerifier: TurnstileVerifier): Router {
  const router = Router();

  router.post('/register', registerHandler(turnstileVerifier));
  router.post('/login', loginHandler);
  router.post('/refresh', refreshHandler);
  router.post('/logout', logoutHandler);
  router.post('/password/reset', passwordResetHandler);
  router.post('/:userId/disable', requireAuth, disableAccountHandler);
  router.get('/me', requireAuth, meHandler);
  router.get('/.well-known/jwks.json', jwksHandler);

  return router;
}
