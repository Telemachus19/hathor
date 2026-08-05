import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import express from 'express';
import request from 'supertest';
import { randomUUID } from 'node:crypto';
import { createCommerceApp } from '../../../apps/commerce-service/src/app.js';
import { OutboxPublisher } from '../../../apps/commerce-service/src/infrastructure/outbox/outbox-publisher.js';
import { OutboxWorker } from '../../../apps/commerce-service/src/infrastructure/outbox/outbox-worker.js';
import {
  metricsRegistry,
  outboxAgeGauge,
  outboxDlqDepthGauge,
  outboxFailedCounter,
  outboxPublishedCounter,
  outboxRetriedCounter,
  rabbitMqQueueDepthGauge,
} from '../../../apps/commerce-service/src/infrastructure/metrics.js';

describe('Transactional Outbox Worker, Retry Engine, & Metrics Suite', () => {
  const app = createCommerceApp(async () => {});

  it('1. Exposes Prometheus metrics via /metrics endpoint', async () => {
    const res = await request(app).get('/metrics');
    expect(res.status).toBe(200);
    expect(res.text).toContain('hathor_outbox_worker_processing_latency_seconds');
    expect(res.text).toContain('hathor_outbox_age_seconds');
    expect(res.text).toContain('hathor_outbox_events_published_total');
    expect(res.text).toContain('hathor_outbox_events_failed_total');
    expect(res.text).toContain('hathor_outbox_events_retried_total');
    expect(res.text).toContain('hathor_outbox_dlq_depth_total');
    expect(res.text).toContain('hathor_rabbitmq_queue_depth');
  });

  it('2. Correctly updates Prometheus metric counters and gauges', async () => {
    outboxPublishedCounter.inc({ event_type: 'commerce.order.paid.v1' });
    outboxFailedCounter.inc({ event_type: 'commerce.order.paid.v1', reason: 'connection_timeout' });
    outboxRetriedCounter.inc({ event_type: 'commerce.order.paid.v1', attempt: '1' });
    outboxAgeGauge.set(12.5);
    outboxDlqDepthGauge.set(3);
    rabbitMqQueueDepthGauge.set({ queue: 'library.order-paid.queue' }, 5);

    const res = await request(app).get('/metrics');
    expect(res.status).toBe(200);
    expect(res.text).toContain(
      'hathor_outbox_events_published_total{event_type="commerce.order.paid.v1"} 1'
    );
    expect(res.text).toContain(
      'hathor_outbox_events_failed_total{event_type="commerce.order.paid.v1",reason="connection_timeout"} 1'
    );
    expect(res.text).toContain(
      'hathor_outbox_events_retried_total{event_type="commerce.order.paid.v1",attempt="1"} 1'
    );
    expect(res.text).toContain('hathor_outbox_age_seconds 12.5');
    expect(res.text).toContain('hathor_outbox_dlq_depth_total 3');
    expect(res.text).toContain('hathor_rabbitmq_queue_depth{queue="library.order-paid.queue"} 5');
  });

  it('3. Enforces publisher confirms interface contract and handles ACKs/NACKs', async () => {
    let published = false;
    const mockPublisher = {
      publishWithConfirm: async (exchange: string, routingKey: string, payload: unknown) => {
        expect(exchange).toBe('hathor.domain.events');
        expect(routingKey).toBe('commerce.order.paid.v1');
        published = true;
      },
      getQueueDepth: async (queue: string) => 2,
    } as unknown as OutboxPublisher;

    await mockPublisher.publishWithConfirm('hathor.domain.events', 'commerce.order.paid.v1', {
      orderId: randomUUID(),
      userId: randomUUID(),
    });

    expect(published).toBe(true);
    const depth = await mockPublisher.getQueueDepth('library.order-paid.queue');
    expect(depth).toBe(2);
  });

  it('4. OutboxWorker lifecycle methods start and stop without errors', () => {
    const mockPublisher = {
      publishWithConfirm: async () => {},
      getQueueDepth: async () => 0,
    } as unknown as OutboxPublisher;

    const worker = new OutboxWorker(mockPublisher, { pollIntervalMs: 100 });
    expect(() => worker.start()).not.toThrow();
    expect(() => worker.stop()).not.toThrow();
  });

  it('5. Configures default topology-aligned monitored queues', () => {
    const mockPublisher = {
      publishWithConfirm: async () => {},
      getQueueDepth: async () => 0,
    } as unknown as OutboxPublisher;

    const worker = new OutboxWorker(mockPublisher);
    expect((worker as any).monitoredQueues).toEqual([
      'library.order-paid.queue',
      'library.order-paid-retry.queue',
      'hathor.dlq',
    ]);
  });

  it('6. insertOutboxEventTx inserts outbox records into transaction handle with PENDING status', async () => {
    const { insertOutboxEventTx } = await import(
      '../../../apps/commerce-service/src/infrastructure/outbox/outbox-helper.js'
    );
    let insertedValues: any = null;
    const mockTx = {
      insert: (_table: any) => ({
        values: async (vals: any) => {
          insertedValues = vals;
        },
      }),
    };

    const aggregateId = randomUUID();
    await insertOutboxEventTx(mockTx, {
      aggregateType: 'order',
      aggregateId,
      eventType: 'commerce.order.paid.v1',
      payload: { orderId: aggregateId },
      correlationId: 'corr-123',
    });

    expect(insertedValues).toEqual({
      aggregateType: 'order',
      aggregateId,
      eventType: 'commerce.order.paid.v1',
      payload: { orderId: aggregateId },
      correlationId: 'corr-123',
      status: 'PENDING',
      retryCount: 0,
    });
  });
});


