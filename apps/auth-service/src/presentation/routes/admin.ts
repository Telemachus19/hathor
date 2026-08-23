import { Router } from 'express';
import { requireAuth } from '../middlewares/auth.js';
import { listUsersHandler } from './admin/users.js';
import { changeUserStatusHandler } from './admin/status.js';
import { changeRolesHandler } from './user/roles.js';

export function createAdminRouter(): Router {
  const router = Router();

  // /admin/users
  router.get('/users', requireAuth, listUsersHandler);

  // /admin/users/:userId/status
  router.patch('/users/:userId/status', requireAuth, changeUserStatusHandler);

  // /admin/users/:userId/roles
  router.post('/users/:userId/roles', requireAuth, changeRolesHandler);

  return router;
}
