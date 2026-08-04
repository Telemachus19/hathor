import { Router, Response } from 'express';
import { eq, and, sql } from 'drizzle-orm';
import { createHash, randomUUID } from 'node:crypto';
import { requireAuth, AuthenticatedRequest } from '../middleware/auth.js';
import { commerceDb } from '../infrastructure/db/client.js';
import {
  carts,
  cartItems,
  orders,
  orderItems,
  idempotencyRecords,
  orderStateTransitions,
} from '../infrastructure/db/schema.js';
import {
  checkLibraryOwnership,
  DependencyUnavailableError,
} from '../infrastructure/clients/library.js';
import { getCatalogQuotes } from '../infrastructure/clients/catalog.js';

const router: Router = Router();

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const ALLOWED_PAYMENT_METHODS = ['sim_fawry', 'sim_vodafone_cash', 'sim_instapay'];

// Helper to compute SHA-256 hash of canonical request body
function computeRequestHash(body: any): string {
  const canonicalStr = JSON.stringify({
    paymentMethod: body.paymentMethod,
    cartVersion: body.cartVersion,
  });
  return createHash('sha256').update(canonicalStr).digest('hex');
}

// Helper to perform in-transaction atomic lookup and replay format check
async function checkAndReplayIdempotencyTx(
  dbOrTx: any,
  key: string,
  currentUserId: string,
  currentRequestHash: string,
  correlationId: string
) {
  const [existingRecord] = await dbOrTx
    .select()
    .from(idempotencyRecords)
    .where(eq(idempotencyRecords.key, key))
    .limit(1);

  if (!existingRecord) {
    return { isHandled: false as const };
  }

  if (
    existingRecord.userId === currentUserId &&
    existingRecord.requestHash === currentRequestHash
  ) {
    const [existingOrder] = await dbOrTx
      .select()
      .from(orders)
      .where(eq(orders.id, existingRecord.orderId))
      .limit(1);

    if (existingOrder) {
      return {
        isHandled: true as const,
        status: 200,
        body: {
          id: existingOrder.id,
          status: existingOrder.status,
          paymentMethod: existingOrder.paymentMethod,
          paymentReference: existingOrder.paymentReference,
          totalAmountEgp: existingOrder.totalAmountEgp,
          currency: existingOrder.currency || 'EGP',
          expiresAt: existingOrder.expiresAt.toISOString(),
        },
      };
    }
  }

  return {
    isHandled: true as const,
    status: 409,
    body: {
      success: false,
      error: {
        code: 'CONFLICT',
        message: 'Idempotency-Key has already been used with different parameters',
        correlationId,
      },
    },
  };
}

// 1. POST /txn/init (Initialize idempotent order)
router.post('/init', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user!.id;
  const correlationId = (req.headers['x-correlation-id'] as string) || randomUUID();
  const idempotencyKey =
    (req.headers['idempotency-key'] as string) || (req.headers['Idempotency-Key'] as string);

  // 1. Validate Idempotency-Key header
  if (!idempotencyKey || !UUID_REGEX.test(idempotencyKey)) {
    return res.status(400).json({
      success: false,
      error: {
        code: 'VALIDATION_FAILED',
        message: 'Missing or invalid Idempotency-Key header (must be a valid UUID v4)',
        correlationId,
      },
    });
  }

  // 2. Validate request body
  const { paymentMethod, cartVersion } = req.body || {};
  if (!paymentMethod || !ALLOWED_PAYMENT_METHODS.includes(paymentMethod)) {
    return res.status(400).json({
      success: false,
      error: {
        code: 'VALIDATION_FAILED',
        message: `Invalid paymentMethod. Allowed: ${ALLOWED_PAYMENT_METHODS.join(', ')}`,
        correlationId,
      },
    });
  }

  if (typeof cartVersion !== 'number' || cartVersion < 1) {
    return res.status(400).json({
      success: false,
      error: {
        code: 'VALIDATION_FAILED',
        message: 'cartVersion must be a positive integer',
        correlationId,
      },
    });
  }

  const requestHash = computeRequestHash(req.body);

  try {
    // 3. Phase 1 DB Transaction: Atomic transaction advisory lock, idempotency check, cart lock & version verify
    type Phase1Result =
      | { success: false; handled: true; status: number; body: any }
      | { success: false; handled: false; errorStatus: number; code: string; message: string }
      | { success: true; gameIds: string[] };

    const phase1Result: Phase1Result = await commerceDb.transaction(async (tx) => {
      // Acquire atomic PostgreSQL transaction advisory lock for the idempotency key string
      if (typeof (tx as any).execute === 'function') {
        await (tx as any).execute(
          sql`SELECT pg_advisory_xact_lock(hashtext(${'idempotency:' + idempotencyKey}))`
        );
      }

      // In-transaction atomic check for existing idempotency record
      const check = await checkAndReplayIdempotencyTx(
        tx,
        idempotencyKey,
        userId,
        requestHash,
        correlationId
      );
      if (check.isHandled) {
        return { success: false, handled: true, status: check.status, body: check.body };
      }

      // Lock cart FOR UPDATE and verify version
      const [cart] = await tx
        .select()
        .from(carts)
        .where(eq(carts.userId, userId))
        .for('update')
        .limit(1);

      if (!cart || cart.version !== cartVersion) {
        return {
          success: false,
          handled: false,
          errorStatus: 409,
          code: 'CONFLICT',
          message: 'Cart version mismatch or cart does not exist',
        };
      }

      const items = await tx
        .select({ gameId: cartItems.gameId })
        .from(cartItems)
        .where(eq(cartItems.userId, userId));

      if (items.length === 0) {
        return {
          success: false,
          handled: false,
          errorStatus: 422,
          code: 'VALIDATION_FAILED',
          message: 'Cannot initialize order for an empty cart',
        };
      }

      return { success: true, gameIds: items.map((i) => i.gameId) };
    });

    if (!phase1Result.success) {
      if (phase1Result.handled) {
        return res.status(phase1Result.status).json(phase1Result.body);
      }
      return res.status(phase1Result.errorStatus).json({
        success: false,
        error: {
          code: phase1Result.code,
          message: phase1Result.message,
          correlationId,
        },
      });
    }

    const gameIds = phase1Result.gameIds;

    // 4. Inter-service calls (outside DB transaction): Catalog quotes + Library ownership check
    const [quoteResponse, ownedGameIds] = await Promise.all([
      getCatalogQuotes(gameIds, correlationId),
      checkLibraryOwnership(userId, gameIds, correlationId),
    ]);

    // 5. Validate quote sellability and ownership
    for (const item of quoteResponse.items) {
      if (!item.sellable) {
        return res.status(409).json({
          success: false,
          error: {
            code: 'CONFLICT',
            message: `Game ${item.gameId} is not available for purchase`,
            correlationId,
          },
        });
      }

      if (ownedGameIds.includes(item.gameId)) {
        return res.status(409).json({
          success: false,
          error: {
            code: 'CONFLICT',
            message: `Game ${item.gameId} is already owned`,
            correlationId,
          },
        });
      }
    }

    // 6. Calculate server-authoritative EGP total
    let totalCents = 0;
    for (const item of quoteResponse.items) {
      totalCents += Math.round(parseFloat(item.priceEgp) * 100);
    }
    const totalAmountEgp = (totalCents / 100).toFixed(2);

    const orderId = randomUUID();
    const paymentReference = `SIM-${randomUUID().substring(0, 8).toUpperCase()}`;
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes TTL

    // 7. Phase 2 DB Transaction: Lock cart again, re-verify version, create order & snapshots
    type Phase2Result =
      | { success: false; handled: true; status: number; body: any }
      | { success: false; handled: false; errorStatus: number; code: string; message: string }
      | { success: true };

    const phase2Result: Phase2Result = await commerceDb.transaction(async (tx) => {
      // Acquire atomic PostgreSQL transaction advisory lock
      if (typeof (tx as any).execute === 'function') {
        await (tx as any).execute(
          sql`SELECT pg_advisory_xact_lock(hashtext(${'idempotency:' + idempotencyKey}))`
        );
      }

      // Re-verify idempotency record in case a concurrent request completed during inter-service calls
      const check = await checkAndReplayIdempotencyTx(
        tx,
        idempotencyKey,
        userId,
        requestHash,
        correlationId
      );
      if (check.isHandled) {
        return { success: false, handled: true, status: check.status, body: check.body };
      }

      const [cart] = await tx
        .select()
        .from(carts)
        .where(eq(carts.userId, userId))
        .for('update')
        .limit(1);

      if (!cart || cart.version !== cartVersion) {
        return {
          success: false,
          handled: false,
          errorStatus: 409,
          code: 'CONFLICT',
          message: 'Cart version mismatch or cart was modified during checkout',
        };
      }

      // Create order
      await tx.insert(orders).values({
        id: orderId,
        userId,
        idempotencyKey,
        cartVersion,
        totalAmountEgp,
        currency: 'EGP',
        paymentMethod,
        paymentReference,
        status: 'payment_pending',
        expiresAt,
      });

      // Insert order items
      for (const item of quoteResponse.items) {
        await tx.insert(orderItems).values({
          orderId,
          gameId: item.gameId,
          titleSnapshot: item.title,
          pricePaidEgp: item.priceEgp,
          priceVersionSnapshot: item.priceVersion,
          currency: 'EGP',
        });
      }

      // Record idempotency key
      await tx.insert(idempotencyRecords).values({
        key: idempotencyKey,
        userId,
        requestHash,
        orderId,
      });

      // Record order state transition audit
      await tx.insert(orderStateTransitions).values({
        orderId,
        fromStatus: null,
        toStatus: 'payment_pending',
        correlationId,
      });

      // Clear caller's cart items and bump cart version
      await tx.delete(cartItems).where(eq(cartItems.userId, userId));
      await tx
        .update(carts)
        .set({
          version: sql`${carts.version} + 1`,
          updatedAt: new Date(),
        })
        .where(eq(carts.userId, userId));

      return { success: true };
    });

    if (!phase2Result.success) {
      if (phase2Result.handled) {
        return res.status(phase2Result.status).json(phase2Result.body);
      }
      return res.status(phase2Result.errorStatus).json({
        success: false,
        error: {
          code: phase2Result.code,
          message: phase2Result.message,
          correlationId,
        },
      });
    }

    return res.status(201).json({
      id: orderId,
      status: 'payment_pending',
      paymentMethod,
      paymentReference,
      totalAmountEgp,
      currency: 'EGP',
      expiresAt: expiresAt.toISOString(),
    });
  } catch (error) {
    // Defensive fallback for unexpected DB unique constraint error (e.g. Postgres 23505)
    try {
      const fallbackCheck = await checkAndReplayIdempotencyTx(
        commerceDb,
        idempotencyKey,
        userId,
        requestHash,
        correlationId
      );
      if (fallbackCheck.isHandled) {
        return res.status(fallbackCheck.status).json(fallbackCheck.body);
      }
    } catch {
      // Ignore fallback error and proceed to standard error handling
    }

    if (error instanceof DependencyUnavailableError) {
      return res.status(503).json({
        success: false,
        error: {
          code: 'DEPENDENCY_UNAVAILABLE',
          message: 'Required internal dependency service is unavailable',
          correlationId,
        },
      });
    }

    console.error('Error initializing transaction:', error);
    return res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to initialize transaction',
        correlationId,
      },
    });
  }
});

// 2. GET /txn/:orderId (Fetch single order details)
router.get('/:orderId', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user!.id;
  const { orderId } = req.params;
  const correlationId = (req.headers['x-correlation-id'] as string) || randomUUID();

  if (!orderId || !UUID_REGEX.test(orderId)) {
    return res.status(400).json({
      success: false,
      error: {
        code: 'VALIDATION_FAILED',
        message: 'Invalid orderId format',
        correlationId,
      },
    });
  }

  try {
    const [order] = await commerceDb
      .select()
      .from(orders)
      .where(and(eq(orders.id, orderId), eq(orders.userId, userId)))
      .limit(1);

    if (!order) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Order not found',
          correlationId,
        },
      });
    }

    return res.status(200).json({
      id: order.id,
      status: order.status,
      paymentMethod: order.paymentMethod,
      paymentReference: order.paymentReference,
      totalAmountEgp: order.totalAmountEgp,
      currency: order.currency || 'EGP',
      expiresAt: order.expiresAt.toISOString(),
    });
  } catch (error) {
    console.error('Error fetching order:', error);
    return res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to fetch order',
        correlationId,
      },
    });
  }
});

export default router;
