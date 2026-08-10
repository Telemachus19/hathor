import { describe, it, expect, beforeAll, afterAll, beforeEach, afterEach } from 'vitest';
import { randomUUID, createHmac } from 'crypto';
import type { Express } from 'express';
import request from 'supertest';
import { eq } from 'drizzle-orm';
import jwt from 'jsonwebtoken';

import { commerceDb } from '../../infrastructure/db/client.js';
import { orders, orderItems, paymentEvents, orderStateTransitions, outboxEvents } from '../../infrastructure/db/schema.js';
import { createCommerceApp } from '../../app.js';

import { createPublicKey } from 'crypto';
import { createServer, Server } from 'http';

process.env.SIMULATOR_WEBHOOK_SECRET = 'test_simulator_webhook_secret_key_123';
process.env.AUTH_SERVICE_URL = 'http://127.0.0.1:5001';

const privateKey = `-----BEGIN PRIVATE KEY-----
MIIEvwIBADANBgkqhkiG9w0BAQEFAASCBKkwggSlAgEAAoIBAQCdLI4kdTiawrJi
slBnkAgDfLYSOJSS9v/BYnycfGCjCyOhKukbb32SyRY6c2gOguE5LSD01j89IGed
T8AHQ1cOVVwyUYtrxYravGWvoiyjQZ/pgbtltYpcWY6tIraJOsMo5rc5z4ldiTO7
KyFZrBOvAXjeUim/g+0VxJpMD+qvYNXm/OIkjSzQmTELjjX0OLA2GZU2HvBYg/jI
tCM+lqx8rm3VaAVAUhqgWVFmjYDO0E8hTj+v4ga07vnzh6FV0yQGn41thlwBSzIu
AAQpTh35fvza5pxbPbR+WR148rNEoJj/XHJKdUY8QrPv5ZOIEux6eUGcQRaKDVLa
TF+DhRi5AgMBAAECggEAFwZlrVwZxnwyt0gxhLZiIialIo6030G9blZP9Hm5C3GQ
juXzH8CJuBTqw3XQHt4YAfEFRLDVM055t18tPbMk//XLy5hMESXvhUM3r07V9LWi
qEnHyurZIdXB08XD0V8xI18HJPotAK2ejTMQj+soOAlCbGlDcemw8/Eo/G8RfY76
iVwjszRepeeK/YuzVklKx84qAyjR/wWjboPO/2RNIM5w8FDtdth/XAvh+Nqgr1N3
UrRX/eK5fJ7L1jh3+6+mquH3+6iW97IH11l0N5tyy1G32PqvXpDl/txHJXSC/odB
ypIw83ta7JkVB0UakA+0CtzDNrwuaqn2SQU5+p60bQKBgQDJhKRfmHh7ZYYkJxmK
TO+9fyTyMiu56Psm/gNYkaaMzZWJd+wavZe50HnNRlqQgXfi0p2OvEVGVCsozQLZ
3cxRid2xnliczSX77iO8Oxu5Cuaey6stEyGSBhnIIE/9Ttkn0EkRqiRZuNJQzxlZ
CE3lSv2WS2U+uSq+c9Y8ROPfhQKBgQDHqsuejkrJPFpcZayEFWSVi8fMaQUbalMZ
J8pNfkl4NtTZz/3zpjnt7S19UetKN2ISWZCdevgkHUTw/oN+bHvln/v1KfaHIIwE
KBTEo5rcsFiss5CsDNxYO2DRN43QUthYeiFbE0yIjJW1JUmHpFpfpnBhoo/U4xEf
w14DTfhopQKBgQCHC6PYCGadUyD881LzUrHKzPzmbebNtKsyq0F0xk7VxyPyNvJ7
zRhzxpkJjp88ffbog3pg4ByQj/FIa3MAq9mzvu9Zi6MYmYZd+W3rQ7VFYV/BhP2W
vF5f7ES0z6qrN37hZnzBIMMxeWFAFDmJZ75D7ehZIvebfB1/+kLUqtoGvQKBgQDG
cUKkWEmNzZUFRev67oQkeWNfDnWL9NWYJ8rR0BTXDK/ptuVv9iKXDOXsKrHN9lNb
Z3bqfWAIDKsLVfl8efd9lc7FsCobzMY8D1XsxanRctb+9gxwYuvQKVulNDCW/u+U
p/Vk3j5vbEISYne8/yTu8a256+ZFsFPBnNtgL2sXHQKBgQCr41e5R1fPxE7xOWIt
upYt6DOYenaQNgAbuItQuVXWJs9AhcLOI4Bk83XZJNXqF1yrI8qWwF2V7HWlNM9m
DDhq9Bqq2Q5DUXjtifv/LI4EseEE122Lgd5Pwi/GEg4YQlSVtnAZat+9xFSLjOIB
9rppLqf+VLyTMzFdXkiS2hPSTw==
-----END PRIVATE KEY-----`;

const publicKey = `-----BEGIN PUBLIC KEY-----
MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAnSyOJHU4msKyYrJQZ5AI
A3y2EjiUkvb/wWJ8nHxgowsjoSrpG299kskWOnNoDoLhOS0g9NY/PSBnnU/AB0NX
DlVcMlGLa8WK2rxlr6Iso0Gf6YG7ZbWKXFmOrSK2iTrDKOa3Oc+JXYkzuyshWawT
rwF43lIpv4PtFcSaTA/qr2DV5vziJI0s0JkxC4419DiwNhmVNh7wWIP4yLQjPpas
fK5t1WgFQFIaoFlRZo2AztBPIU4/r+IGtO7584ehVdMkBp+NbYZcAUsyLgAEKU4d
+X782uacWz20flkdePKzRKCY/1xySnVGPEKz7+WTiBLsenlBnEEWig1S2kxfg4UY
uQIDAQAB
-----END PUBLIC KEY-----`;

const jwk = createPublicKey(publicKey).export({ format: 'jwk' });
describe('Payment Simulator Integration', () => {
  let app: Express;
  let mockAuthServer: Server;

  beforeAll(async () => {
    mockAuthServer = createServer((req, res) => {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ keys: [jwk] }));
    });
    
    await new Promise<void>((resolve) => mockAuthServer.listen(5001, '127.0.0.1', resolve));

    app = createCommerceApp(async () => {});
  });

  afterAll(async () => {
    await new Promise<void>((resolve, reject) => {
      mockAuthServer.close((err) => {
        if (err) return reject(err);
        resolve();
      });
    });
  });

  afterEach(async () => {
    await commerceDb.delete(outboxEvents);
    await commerceDb.delete(orderStateTransitions);
    await commerceDb.delete(paymentEvents);
    await commerceDb.delete(orderItems);
    await commerceDb.delete(orders);
  });


  const generateToken = (userId: string) => {
    return jwt.sign(
      { sub: userId, email: 'test@example.com' },
      privateKey,
      {
        algorithm: 'RS256',
        issuer: 'hathor-auth-service',
        audience: 'hathor-services',
        expiresIn: '1h',
      }
    );
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
