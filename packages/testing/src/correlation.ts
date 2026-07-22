import { randomUUID } from 'node:crypto';

export const CORRELATION_ID_HEADER = 'x-correlation-id';

export function createCorrelationId(): string {
  return randomUUID();
}

export function withCorrelationId(
  headers: Record<string, string> = {},
  correlationId = createCorrelationId()
) {
  return {
    correlationId,
    headers: {
      ...headers,
      [CORRELATION_ID_HEADER]: correlationId,
    },
  };
}
