import { Request, Response, NextFunction } from 'express';

export interface AppErrorPayload {
  code: string;
  message: string;
  status: number;
}

export class AppError extends Error {
  public readonly code: string;
  public readonly status: number;

  constructor(code: string, message: string, status: number = 500) {
    super(message);
    this.code = code;
    this.status = status;
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

/**
 * Final error handler. Normalizes all errors into the standard error model
 * defined in the OpenAPI contract: { error: { code, message, correlationId } }.
 */
export function errorHandler(err: any, req: Request, res: Response, _next: NextFunction): void {
  const status = err.status || err.statusCode || 500;
  const code = err.code || (status === 503 ? 'DEPENDENCY_UNAVAILABLE' : 'INTERNAL_SERVER_ERROR');
  const message =
    err.expose !== false && err.message ? err.message : 'An unexpected server error occurred';

  res.status(status).json({
    error: {
      code,
      message,
      correlationId: req.correlationId,
    },
  });
}

/**
 * Catch-all handler for routes that don't match any proxy namespace.
 * Must be registered after all proxy routes but before the error handler.
 */
export function notFoundHandler(req: Request, res: Response): void {
  res.status(404).json({
    error: {
      code: 'NOT_FOUND',
      message: `Route ${req.method} ${req.originalUrl} not found`,
      correlationId: req.correlationId,
    },
  });
}
