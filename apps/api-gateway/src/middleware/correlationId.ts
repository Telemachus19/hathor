import { randomUUID } from 'node:crypto';
import { Request, Response, NextFunction } from 'express';

const CORRELATION_ID_HEADER = 'x-correlation-id';
const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * Reads an existing X-Correlation-ID from the incoming request or generates
 * a new UUIDv4. The ID is stored on req.correlationId and set as a response header.
 */
export function correlationId(req: Request, res: Response, next: NextFunction): void {
  const incoming = req.headers[CORRELATION_ID_HEADER];
  const id =
    typeof incoming === 'string' && UUID_REGEX.test(incoming) ? incoming : randomUUID();

  req.correlationId = id;
  res.setHeader(CORRELATION_ID_HEADER, id);
  next();
}
