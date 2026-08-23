import { Router, Response } from 'express';
import { desc } from 'drizzle-orm';
import { requireAuth, requireRole, AuthenticatedRequest } from '../middleware/auth.js';
import { commerceDb } from '../infrastructure/db/client.js';
import { orders } from '../infrastructure/db/schema.js';

const router: Router = Router();

// GET /admin/transactions
router.get(
  '/transactions',
  requireAuth,
  requireRole('admin'),
  async (req: AuthenticatedRequest, res: Response) => {
    const limit = Math.min(parseInt(req.query.limit as string) || 25, 100);
    const cursor = parseInt(req.query.cursor as string) || 0;

    try {
      const fetchedOrders = await commerceDb
        .select()
        .from(orders)
        .orderBy(desc(orders.createdAt))
        .limit(limit + 1)
        .offset(cursor);

      let nextCursor: string | null = null;
      if (fetchedOrders.length > limit) {
        nextCursor = (cursor + limit).toString();
        fetchedOrders.pop();
      }

      // Format response to match Order schema
      const formattedOrders = fetchedOrders.map((order) => ({
        id: order.id,
        userId: order.userId,
        totalAmountEgp: order.totalAmountEgp,
        currency: order.currency,
        paymentMethod: order.paymentMethod,
        paymentReference: order.paymentReference,
        status: order.status,
        createdAt: order.createdAt ? order.createdAt.toISOString() : undefined,
      }));

      res.status(200).json({
        items: formattedOrders,
        nextCursor,
      });
    } catch (error) {
      console.error('List transactions error:', error);
      res
        .status(500)
        .json({ error: { code: 'INTERNAL_SERVER_ERROR', message: 'Failed to list transactions' } });
    }
  }
);

export default router;
