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

export function errorHandler(
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
): void {
  const status = err.status || err.statusCode || 500;
  const code = err.code || (status === 503 ? 'PROXY_ERROR' : 'INTERNAL_SERVER_ERROR');
  const message = err.message || 'An unexpected server error occurred';

  res.status(status).json({
    success: false,
    error: {
      code,
      message,
      status,
      timestamp: new Date().toISOString(),
    },
  });
}
