import { describe, expect, it, vi, beforeEach } from 'vitest';
import request from 'supertest';
import { generateKeyPairSync, sign } from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import yaml from 'js-yaml';
import Ajv from 'ajv';
import addFormats from 'ajv-formats';

import { createCatalogApp } from '../../../apps/catalog-service/src/app.js';
import { createCommerceApp } from '../../../apps/commerce-service/src/app.js';

// 1. Generate RS256 key pair for auth middleware verification
const { privateKey, publicKey } = generateKeyPairSync('rsa', {
  modulusLength: 2048,
  publicKeyEncoding: { type: 'spki', format: 'pem' },
  privateKeyEncoding: { type: 'pkcs8', format: 'pem' },
});

process.env.JWT_PUBLIC_KEY = publicKey;

function signJwt(payload: object): string {
  const header = { alg: 'RS256', typ: 'JWT' };
  const base64UrlHeader = Buffer.from(JSON.stringify(header)).toString('base64url');
  const base64UrlPayload = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const signatureInput = `${base64UrlHeader}.${base64UrlPayload}`;
  const signature = sign('sha256', Buffer.from(signatureInput), privateKey).toString('base64url');
  return `${signatureInput}.${signature}`;
}

// 2. Load public-api.openapi.yaml specification
const specPath = path.resolve(
  __dirname,
  '../../../packages/contracts/openapi/public-api.openapi.yaml'
);
const openApiDoc = yaml.load(fs.readFileSync(specPath, 'utf8')) as any;

const ajv = new Ajv({ strict: false, allErrors: true });
addFormats(ajv);

function validateOpenApiSchema(
  schemaName: string,
  data: any
): { valid: boolean; errorsText?: string } {
  const targetSchema = openApiDoc?.components?.schemas?.[schemaName];
  if (!targetSchema) {
    throw new Error(`Schema '${schemaName}' not found in OpenAPI spec`);
  }

  const fullSchema = {
    ...targetSchema,
    components: openApiDoc.components,
  };

  const validate = ajv.compile(fullSchema);
  const valid = validate(data);

  return {
    valid: Boolean(valid),
    errorsText: validate.errors ? ajv.errorsText(validate.errors) : undefined,
  };
}

// 3. Mock Database Clients
vi.mock('../../../apps/catalog-service/src/infrastructure/db/client.js', () => {
  const getNextSelectMock = () => {
    const queue = (globalThis as any).catalogSelectQueue;
    const next = queue.shift();
    return next !== undefined ? next : [];
  };

  const createMockChain = () => {
    const chain: any = {
      from: vi.fn(() => chain),
      where: vi.fn(() => chain),
      limit: vi.fn(() => chain),
      offset: vi.fn(() => chain),
      innerJoin: vi.fn(() => chain),
      then: vi.fn((onFulfilled, onRejected) => {
        return Promise.resolve().then(getNextSelectMock).then(onFulfilled, onRejected);
      }),
    };
    return chain;
  };

  return {
    catalogDb: {
      select: vi.fn(createMockChain),
      selectDistinct: vi.fn(createMockChain),
      query: {
        games: {
          findFirst: vi.fn(async () => (globalThis as any).catalogFindFirstMock || null),
        },
      },
    },
  };
});

vi.mock('../../../apps/commerce-service/src/infrastructure/db/client.js', () => {
  const getNextSelectMock = () => {
    const queue = (globalThis as any).commerceSelectQueue;
    const next = queue.shift();
    return next !== undefined ? next : [];
  };

  const createMockSelectChain = () => {
    const chain: any = {
      from: vi.fn(() => chain),
      where: vi.fn(() => chain),
      limit: vi.fn(() => chain),
      for: vi.fn(() => chain),
      then: vi.fn((onFulfilled, onRejected) => {
        return Promise.resolve().then(getNextSelectMock).then(onFulfilled, onRejected);
      }),
    };
    return chain;
  };

  const createMockInsertChain = () => {
    const chain: any = {};
    chain.values = vi.fn(() => chain);
    chain.onConflictDoNothing = vi.fn(() => chain);
    chain.returning = vi.fn(() => Promise.resolve([]));
    return chain;
  };

  const createMockUpdateChain = () => {
    const chain: any = {};
    chain.set = vi.fn(() => chain);
    chain.where = vi.fn(() => Promise.resolve());
    return chain;
  };

  const createMockDeleteChain = () => {
    const chain: any = {};
    chain.where = vi.fn(() => Promise.resolve());
    return chain;
  };

  const mockTx = {
    select: vi.fn(createMockSelectChain),
    insert: vi.fn(createMockInsertChain),
    update: vi.fn(createMockUpdateChain),
    delete: vi.fn(createMockDeleteChain),
  };

  (globalThis as any).mockCommerceTx = mockTx;

  return {
    commerceDb: {
      select: vi.fn(createMockSelectChain),
      insert: vi.fn(createMockInsertChain),
      transaction: vi.fn((callback) => callback(mockTx)),
    },
  };
});

describe('M2.5.1 OpenAPI Schema Contract Tests', () => {
  let catalogApp: any;
  let commerceApp: any;

  const userId = '00000000-0000-0000-0000-000000000001';
  const gameId = '00000000-0000-0000-0000-000000000002';
  const correlationId = '00000000-0000-0000-0000-000000000005';
  let token: string;

  beforeEach(() => {
    vi.clearAllMocks();
    (globalThis as any).catalogSelectQueue = [];
    (globalThis as any).commerceSelectQueue = [];
    (globalThis as any).catalogFindFirstMock = null;
    (globalThis as any).mockOwnedGameIds = [];

    catalogApp = createCatalogApp(async () => {});
    commerceApp = createCommerceApp(async () => {});

    token = signJwt({
      sub: userId,
      iss: 'hathor-auth-service',
      aud: 'hathor-services',
      roles: ['gamer'],
      exp: Math.floor(Date.now() / 1000) + 900,
    });

    globalThis.fetch = vi.fn(async (url: any) => {
      const urlStr = String(url);
      if (urlStr.includes('/internal/v1/auth/service-tokens')) {
        return {
          ok: true,
          json: async () => ({ accessToken: 'mock-service-token', expiresIn: 300 }),
        } as any;
      }
      if (urlStr.includes('/internal/v1/library/ownership-check')) {
        return {
          ok: true,
          json: async () => ({ ownedGameIds: (globalThis as any).mockOwnedGameIds || [] }),
        } as any;
      }
      return { ok: false, status: 404, statusText: 'Not Found' } as any;
    });
  });

  describe('1. Catalog Storefront Endpoints (/store/games)', () => {
    it('GET /store/games returns 200 published games listing with valid structure', async () => {
      (globalThis as any).catalogSelectQueue = [
        [
          {
            id: gameId,
            slug: 'cyberpunk-odyssey',
            title: 'Cyberpunk Odyssey',
            shortDescription: 'High-octane action RPG',
            priceEgp: '299.99',
            status: 'published',
            createdAt: new Date().toISOString(),
          },
        ],
        [], // game tags
        [{ total: 1 }], // total items
      ];

      const res = await request(catalogApp).get('/store/games');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data.items)).toBe(true);
      expect(res.body.data.pagination).toHaveProperty('totalItems', 1);
    });

    it('GET /store/games/:slug returns published game detail with 200 OK', async () => {
      (globalThis as any).catalogFindFirstMock = {
        id: gameId,
        creatorId: userId,
        slug: 'cyberpunk-odyssey',
        title: 'Cyberpunk Odyssey',
        shortDescription: 'High-octane action RPG',
        fullDescription: 'Full game description',
        priceEgp: '299.99',
        status: 'published',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      (globalThis as any).catalogSelectQueue = [[]]; // tags

      const res = await request(catalogApp).get('/store/games/cyberpunk-odyssey');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.slug).toBe('cyberpunk-odyssey');
      expect(res.body.data.priceEgp).toBe('299.99');
    });
  });

  describe('2. Commerce Cart Endpoints (/cart)', () => {
    it('GET /cart 200 response conforms strictly to Cart OpenAPI schema', async () => {
      (globalThis as any).commerceSelectQueue = [
        [{ userId, version: 1 }],
        [{ userId, version: 1 }],
        [{ gameId }],
      ];

      const res = await request(commerceApp).get('/cart').set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      const validation = validateOpenApiSchema('Cart', res.body);
      expect(validation.valid, validation.errorsText).toBe(true);
    });

    it('GET /cart unauthenticated response conforms strictly to Error OpenAPI schema', async () => {
      const res = await request(commerceApp).get('/cart').set('X-Correlation-ID', correlationId);

      expect(res.status).toBe(401);
      const validation = validateOpenApiSchema('Error', res.body);
      expect(validation.valid, validation.errorsText).toBe(true);
    });

    it('POST /cart/:gameId 200 response conforms strictly to Cart OpenAPI schema', async () => {
      (globalThis as any).commerceSelectQueue = [
        [], // duplicate check (not found)
        [{ userId, version: 1 }], // tx select cart
        [{ userId, version: 2 }], // getCartResponse cart
        [{ gameId }], // getCartResponse items
      ];

      const res = await request(commerceApp)
        .post(`/cart/${gameId}`)
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      const validation = validateOpenApiSchema('Cart', res.body);
      expect(validation.valid, validation.errorsText).toBe(true);
    });

    it('POST /cart/:gameId 400 invalid gameId UUID format conforms to Error OpenAPI schema', async () => {
      const res = await request(commerceApp)
        .post('/cart/invalid-uuid-format')
        .set('Authorization', `Bearer ${token}`)
        .set('X-Correlation-ID', correlationId);

      expect(res.status).toBe(400);
      const validation = validateOpenApiSchema('Error', res.body);
      expect(validation.valid, validation.errorsText).toBe(true);
    });

    it('POST /cart/:gameId 409 duplicate game addition conforms to Error OpenAPI schema', async () => {
      (globalThis as any).commerceSelectQueue = [[{ userId, gameId }]];

      const res = await request(commerceApp)
        .post(`/cart/${gameId}`)
        .set('Authorization', `Bearer ${token}`)
        .set('X-Correlation-ID', correlationId);

      expect(res.status).toBe(409);
      const validation = validateOpenApiSchema('Error', res.body);
      expect(validation.valid, validation.errorsText).toBe(true);
    });

    it('DELETE /cart/:gameId 200 response conforms strictly to Cart OpenAPI schema', async () => {
      (globalThis as any).commerceSelectQueue = [
        [{ userId, gameId }], // item exists check
        [{ userId, version: 2 }], // response cart
        [], // response items
      ];

      const res = await request(commerceApp)
        .delete(`/cart/${gameId}`)
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      const validation = validateOpenApiSchema('Cart', res.body);
      expect(validation.valid, validation.errorsText).toBe(true);
    });

    it('DELETE /cart/:gameId 400 invalid gameId UUID format conforms to Error OpenAPI schema', async () => {
      const res = await request(commerceApp)
        .delete('/cart/invalid-uuid-format')
        .set('Authorization', `Bearer ${token}`)
        .set('X-Correlation-ID', correlationId);

      expect(res.status).toBe(400);
      const validation = validateOpenApiSchema('Error', res.body);
      expect(validation.valid, validation.errorsText).toBe(true);
    });
  });
});
