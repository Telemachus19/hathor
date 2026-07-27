import { Response } from 'express';
import { AuthenticatedRequest } from '../../middlewares/auth.js';

export function meHandler(req: AuthenticatedRequest, res: Response) {
  // If requireAuth middleware passes, req.user is guaranteed to be populated
  return res.status(200).json(req.user);
}
