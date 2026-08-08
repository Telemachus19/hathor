import { describe, expect, it, vi, beforeEach } from 'vitest';
import amqp from 'amqplib';
import { startQueueConsumer } from '../../../apps/library-service/src/infrastructure/queue-consumer.js';

// Setup database mocks inside the factory function to avoid hoisting issues
vi.mock('../../../apps/library-service/src/infrastructure/db/client.js', () => {
  const mockTx = {
    insert: vi.fn(() => ({
      values: vi.fn(() => Promise.resolve()),
    })),
  };

  const mockDb = {
    transaction: vi.fn((cb) => cb(mockTx)),
  };

  (globalThis as any).libraryMockTx = mockTx;
  (globalThis as any).libraryMockDb = mockDb;

  return {
    libraryDb: mockDb,
  };
});

// Helpers to access the mocks in tests
const getMockTx = () => (globalThis as any).libraryMockTx;
const getMockDb = () => (globalThis as any).libraryMockDb;

// Define RabbitMQ mock objects
const mockChannel = {
  prefetch: vi.fn(() => Promise.resolve()),
  consume: vi.fn((queue, cb) => {
    (globalThis as any).libraryConsumeCallback = cb;
    return Promise.resolve();
  }),
  ack: vi.fn(),
  nack: vi.fn(),
  publish: vi.fn(),
};

const mockConn = {
  createChannel: vi.fn(() => Promise.resolve(mockChannel)),
};

// Helper to access captured callback and channel mocks
const getMockChannel = () => mockChannel;
const getConsumeCallback = () => (globalThis as any).libraryConsumeCallback;

describe('Library Queue Consumer & Idempotency Ledger', () => {
  const validEvent = {
    eventId: 'e98e727f-9ce0-482a-a92c-882299bd0c72',
    eventType: 'commerce.order.paid.v1',
    schemaVersion: 1,
    occurredAt: '2026-08-06T12:00:00.000Z',
    correlationId: 'f0a8d8ea-a312-42da-be21-d68a98bc19d3',
    producer: 'commerce-service',
    payload: {
      orderId: 'd3810ea3-1da8-4be8-89c0-f89a9da8cd72',
      userId: '93a8d11c-1db8-498c-890d-58da1b98a83d',
      items: [
        {
          gameId: 'aa123bfa-b9a1-432d-891d-aa890cb12d8a',
          titleSnapshot: 'Mock Game',
          pricePaidEgp: '299.99',
          currency: 'EGP',
        },
      ],
    },
  };

  beforeEach(async () => {
    vi.clearAllMocks();

    // Spy on amqp.connect to intercept the connection call and return mockConn
    vi.spyOn(amqp, 'connect').mockResolvedValue(mockConn as any);

    // Initialize the consumer to capture the callback
    await startQueueConsumer('amqp://localhost');
  });

  it('successfully processes valid order paid event, grants licenses, and ACKs message', async () => {
    const msg = {
      content: Buffer.from(JSON.stringify(validEvent)),
      fields: { routingKey: 'commerce.order.paid.v1' },
      properties: { headers: {} },
    } as any;

    await getConsumeCallback()(msg);

    // Assert database transaction is executed and inserts are called
    expect(getMockDb().transaction).toHaveBeenCalled();
    expect(getMockTx().insert).toHaveBeenCalledTimes(4); // processedEvent, userLicense, entitlementAudit, outboxEvent

    // Assert message is ACKed
    expect(getMockChannel().ack).toHaveBeenCalledWith(msg);
    expect(getMockChannel().nack).not.toHaveBeenCalled();
    expect(getMockChannel().publish).not.toHaveBeenCalled();
  });

  it('safely ignores duplicate deliveries with 23505 unique violations and ACKs', async () => {
    const dbError: any = new Error('Unique constraint violation');
    dbError.code = '23505';

    // Make database transaction throw unique constraint violation (duplicate eventId)
    getMockDb().transaction.mockRejectedValueOnce(dbError);

    const msg = {
      content: Buffer.from(JSON.stringify(validEvent)),
      fields: { routingKey: 'commerce.order.paid.v1' },
      properties: { headers: {} },
    } as any;

    await getConsumeCallback()(msg);

    // Transaction was called but failure was caught and handled
    expect(getMockDb().transaction).toHaveBeenCalled();
    expect(getMockChannel().ack).toHaveBeenCalledWith(msg);
    expect(getMockChannel().nack).not.toHaveBeenCalled();
    expect(getMockChannel().publish).not.toHaveBeenCalled();
  });

  it('routes malformed events directly to the DLQ and ACKs the original message', async () => {
    const malformedEvent = {
      ...validEvent,
      payload: {
        ...validEvent.payload,
        userId: 'not-a-uuid', // invalid type
      },
    };

    const msg = {
      content: Buffer.from(JSON.stringify(malformedEvent)),
      fields: { routingKey: 'commerce.order.paid.v1' },
      properties: { headers: {} },
    } as any;

    await getConsumeCallback()(msg);

    // Expect message sent to DLQ (hathor.dlx) and ACKed to remove from queue
    expect(getMockChannel().publish).toHaveBeenCalledWith(
      'hathor.dlx',
      'commerce.order.paid.v1',
      msg.content,
      expect.any(Object)
    );
    expect(getMockChannel().ack).toHaveBeenCalledWith(msg);
    expect(getMockChannel().nack).not.toHaveBeenCalled();
  });

  it('nacks transient errors to allow retry queue backoff if death count < 5', async () => {
    const transientError = new Error('Database connection timeout');
    getMockDb().transaction.mockRejectedValueOnce(transientError);

    const msg = {
      content: Buffer.from(JSON.stringify(validEvent)),
      fields: { routingKey: 'commerce.order.paid.v1' },
      properties: {
        headers: {
          'x-death': [
            {
              queue: 'library.order-paid.queue',
              count: 2, // 2 retries so far
            },
          ],
        },
      },
    } as any;

    await getConsumeCallback()(msg);

    // Expect NACK without requeue (to forward to x-dead-letter-exchange hathor.retry)
    expect(getMockChannel().nack).toHaveBeenCalledWith(msg, false, false);
    expect(getMockChannel().publish).not.toHaveBeenCalled();
    expect(getMockChannel().ack).not.toHaveBeenCalled();
  });

  it('forwards message to DLQ and ACKs if max retry count (5) is exceeded', async () => {
    const transientError = new Error('Persistent database failure');
    getMockDb().transaction.mockRejectedValueOnce(transientError);

    const msg = {
      content: Buffer.from(JSON.stringify(validEvent)),
      fields: { routingKey: 'commerce.order.paid.v1' },
      properties: {
        headers: {
          'x-death': [
            {
              queue: 'library.order-paid.queue',
              count: 5, // 5 retries reached
            },
          ],
        },
      },
    } as any;

    await getConsumeCallback()(msg);

    // Expect published to DLQ (hathor.dlx) and original message ACKed
    expect(getMockChannel().publish).toHaveBeenCalledWith(
      'hathor.dlx',
      'commerce.order.paid.v1',
      msg.content,
      expect.any(Object)
    );
    expect(getMockChannel().ack).toHaveBeenCalledWith(msg);
    expect(getMockChannel().nack).not.toHaveBeenCalled();
  });
});
