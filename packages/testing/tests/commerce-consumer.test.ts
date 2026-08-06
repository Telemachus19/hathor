import { describe, expect, it, vi, beforeEach } from 'vitest';
import amqp from 'amqplib';
import { startQueueConsumer } from '../../../apps/commerce-service/src/infrastructure/queue-consumer.js';

// Setup database mocks inside the factory function to avoid hoisting issues
vi.mock('../../../apps/commerce-service/src/infrastructure/db/client.js', () => {
  const mockTx = {
    select: vi.fn(),
    update: vi.fn(),
    insert: vi.fn(),
  };

  const mockDb = {
    transaction: vi.fn((cb) => cb(mockTx)),
  };

  (globalThis as any).commerceMockTx = mockTx;
  (globalThis as any).commerceMockDb = mockDb;

  return {
    commerceDb: mockDb,
  };
});

// Helpers to access the mocks in tests
const getMockTx = () => (globalThis as any).commerceMockTx;
const getMockDb = () => (globalThis as any).commerceMockDb;

// Define RabbitMQ mock objects
const mockChannel = {
  prefetch: vi.fn(() => Promise.resolve()),
  consume: vi.fn((queue, cb) => {
    (globalThis as any).commerceConsumeCallback = cb;
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
const getConsumeCallback = () => (globalThis as any).commerceConsumeCallback;

describe('Commerce Queue Consumer & Order Fulfillment', () => {
  const validEvent = {
    eventId: 'e98e727f-9ce0-482a-a92c-882299bd0c72',
    eventType: 'library.entitlement.granted.v1',
    schemaVersion: 1,
    occurredAt: '2026-08-06T12:00:00.000Z',
    correlationId: 'f0a8d8ea-a312-42da-be21-d68a98bc19d3',
    producer: 'library-service',
    payload: {
      orderId: 'd3810ea3-1da8-4be8-89c0-f89a9da8cd72',
      userId: '93a8d11c-1db8-498c-890d-58da1b98a83d',
      gameIds: ['aa123bfa-b9a1-432d-891d-aa890cb12d8a'],
    },
  };

  beforeEach(async () => {
    vi.clearAllMocks();

    // Spy on amqp.connect to intercept the connection call and return mockConn
    vi.spyOn(amqp, 'connect').mockResolvedValue(mockConn as any);

    // Initialize the consumer to capture the callback
    await startQueueConsumer('amqp://localhost');
  });

  it('successfully fulfills a pending order, logs transition, and ACKs message', async () => {
    // Setup select mock to return a payment_pending order
    const mockSelectChain: any = {
      from: vi.fn(() => mockSelectChain),
      where: vi.fn(() => mockSelectChain),
      for: vi.fn(() => mockSelectChain),
      limit: vi.fn(() => Promise.resolve([{ id: 'd3810ea3-1da8-4be8-89c0-f89a9da8cd72', status: 'fulfillment_pending' }])),
    };
    getMockTx().select.mockReturnValue(mockSelectChain);

    const mockUpdateChain: any = {
      set: vi.fn(() => mockUpdateChain),
      where: vi.fn(() => Promise.resolve()),
    };
    getMockTx().update.mockReturnValue(mockUpdateChain);

    const mockInsertChain: any = {
      values: vi.fn(() => Promise.resolve()),
    };
    getMockTx().insert.mockReturnValue(mockInsertChain);

    const msg = {
      content: Buffer.from(JSON.stringify(validEvent)),
      fields: { routingKey: 'library.entitlement.granted.v1' },
      properties: { headers: {} },
    } as any;

    await getConsumeCallback()(msg);

    // Assert database calls
    expect(getMockDb().transaction).toHaveBeenCalled();
    expect(getMockTx().select).toHaveBeenCalled();
    expect(getMockTx().update).toHaveBeenCalled();
    expect(getMockTx().insert).toHaveBeenCalled(); // Order state transition audit

    // Assert message is ACKed
    expect(getMockChannel().ack).toHaveBeenCalledWith(msg);
    expect(getMockChannel().nack).not.toHaveBeenCalled();
    expect(getMockChannel().publish).not.toHaveBeenCalled();
  });

  it('safely ignores events for orders that are already fulfilled and ACKs', async () => {
    // Setup select mock to return an already fulfilled order
    const mockSelectChain: any = {
      from: vi.fn(() => mockSelectChain),
      where: vi.fn(() => mockSelectChain),
      for: vi.fn(() => mockSelectChain),
      limit: vi.fn(() => Promise.resolve([{ id: 'd3810ea3-1da8-4be8-89c0-f89a9da8cd72', status: 'fulfilled' }])),
    };
    getMockTx().select.mockReturnValue(mockSelectChain);

    const msg = {
      content: Buffer.from(JSON.stringify(validEvent)),
      fields: { routingKey: 'library.entitlement.granted.v1' },
      properties: { headers: {} },
    } as any;

    await getConsumeCallback()(msg);

    // Assert database select happened, but update and insert did not
    expect(getMockDb().transaction).toHaveBeenCalled();
    expect(getMockTx().select).toHaveBeenCalled();
    expect(getMockTx().update).not.toHaveBeenCalled();
    expect(getMockTx().insert).not.toHaveBeenCalled();

    // Assert message is ACKed
    expect(getMockChannel().ack).toHaveBeenCalledWith(msg);
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
      fields: { routingKey: 'library.entitlement.granted.v1' },
      properties: { headers: {} },
    } as any;

    await getConsumeCallback()(msg);

    // Expect message sent to DLQ (hathor.dlx) and ACKed to remove from queue
    expect(getMockChannel().publish).toHaveBeenCalledWith(
      'hathor.dlx',
      'library.entitlement.granted.v1',
      msg.content,
      expect.any(Object)
    );
    expect(getMockChannel().ack).toHaveBeenCalledWith(msg);
    expect(getMockChannel().nack).not.toHaveBeenCalled();
  });

  it('nacks transient errors to allow retry queue backoff if death count < 5', async () => {
    // Make select query fail with connection error
    const selectError = new Error('Database connection failed');
    getMockTx().select.mockImplementationOnce(() => {
      throw selectError;
    });

    const msg = {
      content: Buffer.from(JSON.stringify(validEvent)),
      fields: { routingKey: 'library.entitlement.granted.v1' },
      properties: {
        headers: {
          'x-death': [
            {
              queue: 'commerce.entitlement-granted.queue',
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
});
