import { Router, Response } from 'express';
import { eq, and, sql } from 'drizzle-orm';
import { requireAuth, AuthenticatedRequest } from '../middleware/auth.js';
import { commerceDb } from '../infrastructure/db/client.js';
import { carts, cartItems } from '../infrastructure/db/schema.js';
import { randomUUID } from 'node:crypto';

const router: Router = Router();

// Helper to query the cart state in the format expected by the OpenAPI schema
async function getCartResponse(userId: string) {
  const [cart] = await commerceDb.select().from(carts).where(eq(carts.userId, userId)).limit(1);
  const items = await commerceDb
    .select({ gameId: cartItems.gameId })
    .from(cartItems)
    .where(eq(cartItems.userId, userId));

  return {
    version: cart ? cart.version : 1,
    items: items.map(item => ({ gameId: item.gameId }))
  };
}

// 1. GET /cart (Retrieve active cart)
router.get('/', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user!.id;
  const correlationId = (req.headers['x-correlation-id'] as string) || randomUUID();

  try {
    // Check if cart exists; if not, create it with version = 1
    const [cart] = await commerceDb.select().from(carts).where(eq(carts.userId, userId)).limit(1);
    if (!cart) {
      await commerceDb.insert(carts).values({ userId, version: 1 }).onConflictDoNothing();
    }

    const responseData = await getCartResponse(userId);
    return res.status(200).json(responseData);
  } catch (error) {
    console.error('Error fetching cart:', error);
    return res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to fetch cart',
        correlationId
      }
    });
  }
});

// 2. POST /cart/:gameId (Add item to cart)
router.post('/:gameId', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user!.id;
  const { gameId } = req.params;
  const correlationId = (req.headers['x-correlation-id'] as string) || randomUUID();

  // Validate gameId as Uuid format
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (!gameId || !uuidRegex.test(gameId)) {
    return res.status(400).json({
      success: false,
      error: {
        code: 'VALIDATION_FAILED',
        message: 'Invalid gameId format (must be a valid UUID)',
        correlationId
      }
    });
  }

  try {
    // Reject duplicate additions
    const [existingItem] = await commerceDb
      .select()
      .from(cartItems)
      .where(and(eq(cartItems.userId, userId), eq(cartItems.gameId, gameId)))
      .limit(1);

    if (existingItem) {
      return res.status(409).json({
        success: false,
        error: {
          code: 'CONFLICT',
          message: 'Game is already in the cart',
          correlationId
        }
      });
    }

    // Atomically modify the cart and increment version in a transaction
    await commerceDb.transaction(async (tx) => {
      const [cart] = await tx.select().from(carts).where(eq(carts.userId, userId)).limit(1);
      if (!cart) {
        await tx.insert(carts).values({ userId, version: 1 });
      } else {
        await tx
          .update(carts)
          .set({
            version: sql`${carts.version} + 1`,
            updatedAt: new Date()
          })
          .where(eq(carts.userId, userId));
      }

      await tx.insert(cartItems).values({ userId, gameId });
    });

    const responseData = await getCartResponse(userId);
    return res.status(200).json(responseData);
  } catch (error) {
    console.error('Error adding item to cart:', error);
    return res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to add item to cart',
        correlationId
      }
    });
  }
});

// 3. DELETE /cart/:gameId (Remove item from cart)
router.delete('/:gameId', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user!.id;
  const { gameId } = req.params;
  const correlationId = (req.headers['x-correlation-id'] as string) || randomUUID();

  // Validate gameId as Uuid format
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (!gameId || !uuidRegex.test(gameId)) {
    return res.status(400).json({
      success: false,
      error: {
        code: 'VALIDATION_FAILED',
        message: 'Invalid gameId format (must be a valid UUID)',
        correlationId
      }
    });
  }

  try {
    const [existingItem] = await commerceDb
      .select()
      .from(cartItems)
      .where(and(eq(cartItems.userId, userId), eq(cartItems.gameId, gameId)))
      .limit(1);

    // Only increment version if the item actually exists and gets removed
    if (existingItem) {
      await commerceDb.transaction(async (tx) => {
        await tx
          .delete(cartItems)
          .where(and(eq(cartItems.userId, userId), eq(cartItems.gameId, gameId)));

        await tx
          .update(carts)
          .set({
            version: sql`${carts.version} + 1`,
            updatedAt: new Date()
          })
          .where(eq(carts.userId, userId));
      });
    }

    const responseData = await getCartResponse(userId);
    return res.status(200).json(responseData);
  } catch (error) {
    console.error('Error removing item from cart:', error);
    return res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to remove item from cart',
        correlationId
      }
    });
  }
});

export default router;
