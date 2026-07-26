import { Request, Response, NextFunction } from 'express';

/**
 * Blocks any external request attempting to reach /internal/* endpoints.
 * The gateway is a reverse proxy for public routes only — internal
 * service-to-service paths must never be reachable from outside.
 */
export function internalPathBlocker(req: Request, res: Response, next: NextFunction): void {
  if (req.path.startsWith('/internal')) {
    res.status(403).json({
      error: {
        code: 'FORBIDDEN',
        message: 'Internal paths are not accessible',
        correlationId: req.correlationId,
      },
    });
    return;
  }
  next();
}
