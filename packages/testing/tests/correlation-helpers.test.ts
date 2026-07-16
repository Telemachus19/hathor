import { describe, expect, it } from 'vitest';
import { CORRELATION_ID_HEADER, createEventFixture, withCorrelationId } from '../src/index.js';

describe('correlation test helpers', () => {
  it('adds the same UUID to HTTP headers and event envelopes', () => {
    const http = withCorrelationId({ authorization: 'Bearer test-token' });
    const event = createEventFixture({
      eventType: 'commerce.order.paid.v1',
      producer: 'commerce-service',
      correlationId: http.correlationId,
      payload: { orderId: 'test-order' },
    });

    expect(http.correlationId).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
    );
    expect(http.headers[CORRELATION_ID_HEADER]).toBe(http.correlationId);
    expect(http.headers.authorization).toBe('Bearer test-token');
    expect(event.correlationId).toBe(http.correlationId);
    expect(event.schemaVersion).toBe(1);
  });
});
