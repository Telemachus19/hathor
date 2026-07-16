import request from 'supertest';
import { describe, expect, it } from 'vitest';
import { createGatewayApp } from '../../../apps/api-gateway/src/app.js';
import { createAuthApp } from '../../../apps/auth-service/src/app.js';
import { createCatalogApp } from '../../../apps/catalog-service/src/app.js';
import { createCommerceApp } from '../../../apps/commerce-service/src/app.js';
import { createLibraryApp } from '../../../apps/library-service/src/app.js';
import { withCorrelationId } from '../src/index.js';

const ready = async () => undefined;
const services = [
  ['api-gateway', createGatewayApp()],
  ['auth-service', createAuthApp(ready)],
  ['catalog-service', createCatalogApp(ready)],
  ['commerce-service', createCommerceApp(ready)],
  ['library-service', createLibraryApp(ready)],
] as const;

describe('service health foundation', () => {
  it.each(services)('%s exposes live and ready probes', async (service, app) => {
    const { headers } = withCorrelationId();

    const liveResponse = await request(app).get('/health/live').set(headers);
    const readyResponse = await request(app).get('/health/ready').set(headers);

    expect(liveResponse.status).toBe(200);
    expect(liveResponse.body.data).toMatchObject({ service, status: 'live' });
    expect(readyResponse.status).toBe(200);
    expect(readyResponse.body.data).toMatchObject({ service, status: 'ready' });
  });

  it('reports dependency failure without failing liveness', async () => {
    const app = createAuthApp(async () => {
      throw new Error('database unavailable');
    });

    const liveResponse = await request(app).get('/health/live');
    const readyResponse = await request(app).get('/health/ready');

    expect(liveResponse.status).toBe(200);
    expect(readyResponse.status).toBe(503);
    expect(readyResponse.body.error.code).toBe('SERVICE_NOT_READY');
  });
});
