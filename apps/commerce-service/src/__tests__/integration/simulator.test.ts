import { describe, it, expect, beforeAll, afterEach } from 'vitest';
import { randomUUID, createHmac } from 'crypto';
import type { Express } from 'express';
import request from 'supertest';
import { eq } from 'drizzle-orm';
import jwt from 'jsonwebtoken';

import { commerceDb } from '../../infrastructure/db/client.js';
import { orders, orderItems, paymentEvents, orderStateTransitions, outboxEvents } from '../../infrastructure/db/schema.js';
import { createCommerceApp } from '../../app.js';

process.env.SIMULATOR_WEBHOOK_SECRET = 'test_simulator_webhook_secret_key_123';
process.env.JWT_SECRET = 'test_jwt_secret';

describe('Payment Simulator Integration', () => {
  let app: Express;

  beforeAll(() => {
    app = createCommerceApp(async () => {});
  });

  afterEach(async () => {
    await commerceDb.delete(outboxEvents);
    await commerceDb.delete(orderStateTransitions);
    await commerceDb.delete(paymentEvents);
    await commerceDb.delete(orderItems);
    await commerceDb.delete(orders);
  });

  const generateToken = (userId: string) => {
    return jwt.sign({ id: userId, email: 'test@example.com' }, process.env.JWT_SECRET!, { expiresIn: '1h' });
  };

  const createPendingOrder = async (userId: string, overrides: Partial<typeof orders.$inferInsert> = {}) => {
    const orderId = overrides.id || randomUUID();
    const paymentReference = overrides.paymentReference || `SIM-${randomUUID().substring(0, 8).toUpperCase()}`;
    
    await commerceDb.insert(orders).values({
      id: orderId,
      userId,
      totalAmountEgp: '100.00',
      currency: 'EGP',
      paymentMethod: 'sim_fawry',
      paymentReference,
      status: 'payment_pending',
      expiresAt: new Date(Date.now() + 15 * 60 * 1000),
      ...overrides,
    });
    
    await commerceDb.insert(orderItems).values({
      orderId,
      gameId: randomUUID(),
      titleSnapshot: 'Test Game',
      pricePaidEgp: '100.00',
      currency: 'EGP',
    });

    return { orderId, paymentReference };
  };

  const createWebhookPayload = (paymentReference: string, overrides: any = {}) => ({
    eventId: randomUUID(),
    paymentReference,
    amountEgp: '100.00',
    currency: 'EGP',
    outcome: 'paid',
    occurredAt: new Date().toISOString(),
    ...overrides,
  });

  const signPayload = (payload: any) => {
    const rawBody = Buffer.from(JSON.stringify(payload), 'utf8');
    return createHmac('sha256', process.env.SIMULATOR_WEBHOOK_SECRET!)
      .update(rawBody)
      .digest('hex');
  };

  describe('Webhook Ingestion (POST /txn/webhooks/simulator)', () => {
    it('should process a valid webhook successfully', async () => {
      const userId = randomUUID();
      const { orderId, paymentReference } = await createPendingOrder(userId);
      const payload = createWebhookPayload(paymentReference);
      
      const res = await request(app)
        .post('/txn/webhooks/simulator')
        .set('X-Hathor-Signature', signPayload(payload))
        .send(payload);

      expect(res.status).toBe(204);

      const [order] = await commerceDb.select().from(orders).where(eq(orders.id, orderId));
      expect(order.status).toBe('fulfillment_pending');

      const transitions = await commerceDb.select().from(orderStateTransitions).where(eq(orderStateTransitions.orderId, orderId));
      expect(transitions.length).toBeGreaterThanOrEqual(2);

      const events = await commerceDb.select().from(paymentEvents).where(eq(paymentEvents.orderId, orderId));
      expect(events).toHaveLength(1);
      expect(events[0].providerEventId).toBe(payload.eventId);

      const outbox = await commerceDb.select().from(outboxEvents).where(eq(outboxEvents.aggregateId, orderId));
      expect(outbox).toHaveLength(1);
      expect(outbox[0].eventType).toBe('commerce.order.paid.v1');
    });

    it('should reject invalid HMAC signature', async () => {
      const payload = createWebhookPayload('SIM-123');
      const res = await request(app)
        .post('/txn/webhooks/simulator')
        .set('X-Hathor-Signature', 'invalid_signature')
        .send(payload);

      expect(res.status).toBe(401);
    });

    it('should reject stale timestamp', async () => {
      const payload = createWebhookPayload('SIM-123', {
        occurredAt: new Date(Date.now() - 301_000).toISOString(),
      });
      const res = await request(app)
        .post('/txn/webhooks/simulator')
        .set('X-Hathor-Signature', signPayload(payload))
        .send(payload);

      expect(res.status).toBe(422);
    });

    it('should reject future timestamp', async () => {
      const payload = createWebhookPayload('SIM-123', {
        occurredAt: new Date(Date.now() + 60_000).toISOString(),
      });
      const res = await request(app)
        .post('/txn/webhooks/simulator')
        .set('X-Hathor-Signature', signPayload(payload))
        .send(payload);

      expect(res.status).toBe(422);
    });

    it('should deduplicate exact replay', async () => {
      const userId = randomUUID();
      const { paymentReference } = await createPendingOrder(userId);
      const payload = createWebhookPayload(paymentReference);
      const signature = signPayload(payload);
      
      const res1 = await request(app).post('/txn/webhooks/simulator').set('X-Hathor-Signature', signature).send(payload);
      expect(res1.status).toBe(204);

      const res2 = await request(app).post('/txn/webhooks/simulator').set('X-Hathor-Signature', signature).send(payload);
      expect(res2.status).toBe(204);
    });

    it('should reject inconsistent replay', async () => {
      const userId = randomUUID();
      const { paymentReference } = await createPendingOrder(userId);
      const payload = createWebhookPayload(paymentReference);
      
      const res1 = await request(app).post('/txn/webhooks/simulator').set('X-Hathor-Signature', signPayload(payload)).send(payload);
      expect(res1.status).toBe(204);

      const payload2 = { ...payload, amountEgp: '200.00' };
      const res2 = await request(app).post('/txn/webhooks/simulator').set('X-Hathor-Signature', signPayload(payload2)).send(payload2);
      expect(res2.status).toBe(422);
    });
  });

  describe('Simulator Trigger (POST /txn/:orderId/simulate-payment)', () => {
    it('should process simulation correctly for owner', async () => {
      const userId = randomUUID();
      const token = generateToken(userId);
      const { orderId } = await createPendingOrder(userId);

      const res = await request(app)
        .post(`/txn/${orderId}/simulate-payment`)
        .set('Authorization', `Bearer ${token}`)
        .send({ outcome: 'paid' });

      expect(res.status).toBe(202);
    });

    it('should reject unauthenticated request', async () => {
      const orderId = randomUUID();
      const res = await request(app)
        .post(`/txn/${orderId}/simulate-payment`)
        .send({ outcome: 'paid' });

      expect(res.status).toBe(401);
    });

    it('should reject non-owner request', async () => {
      const userId = randomUUID();
      const otherUserId = randomUUID();
      const token = generateToken(otherUserId);
      const { orderId } = await createPendingOrder(userId);

      const res = await request(app)
        .post(`/txn/${orderId}/simulate-payment`)
        .set('Authorization', `Bearer ${token}`)
        .send({ outcome: 'paid' });

      expect(res.status).toBe(403);
    });

    it('should reject if order is expired', async () => {
      const userId = randomUUID();
      const token = generateToken(userId);
      const { orderId } = await createPendingOrder(userId, { expiresAt: new Date(Date.now() - 1000) });

      const res = await request(app)
        .post(`/txn/${orderId}/simulate-payment`)
        .set('Authorization', `Bearer ${token}`)
        .send({ outcome: 'paid' });

      expect(res.status).toBe(409);
    });

    it('should reject invalid payment method', async () => {
      const userId = randomUUID();
      const token = generateToken(userId);
      const { orderId } = await createPendingOrder(userId, { paymentMethod: 'stripe' });

      const res = await request(app)
        .post(`/txn/${orderId}/simulate-payment`)
        .set('Authorization', `Bearer ${token}`)
        .send({ outcome: 'paid' });

      expect(res.status).toBe(409);
    });
  });

  describe('Concurrency & Atomicity', () => {
    it('should handle concurrent webhooks gracefully', async () => {
      const userId = randomUUID();
      const { orderId, paymentReference } = await createPendingOrder(userId);
      const payload = createWebhookPayload(paymentReference);
      const signature = signPayload(payload);
      
      const req1 = request(app).post('/txn/webhooks/simulator').set('X-Hathor-Signature', signature).send(payload);
      const req2 = request(app).post('/txn/webhooks/simulator').set('X-Hathor-Signature', signature).send(payload);

      const [res1, res2] = await Promise.all([req1, req2]);
      
      expect(res1.status).toBe(204);
      expect(res2.status).toBe(204);

      const outbox = await commerceDb.select().from(outboxEvents).where(eq(outboxEvents.aggregateId, orderId));
      expect(outbox).toHaveLength(1);
    });
  });
});
