import { Router, Request, Response } from 'express';
import { eq, sql } from 'drizzle-orm';
import { requireServiceScope } from '../middleware/auth.js';
import { commerceDb } from '../infrastructure/db/client.js';
import { orders, orderItems } from '../infrastructure/db/schema.js';

const router: Router = Router();

// GET /internal/v1/analytics/:gameId
router.get(
  '/analytics/:gameId',
  requireServiceScope('commerce.analytics.read'),
  async (req: Request, res: Response) => {
    const { gameId } = req.params;

    try {
      // We need to fetch fulfilled orders for this game
      const results = await commerceDb
        .select({
          pricePaidEgp: orderItems.pricePaidEgp,
          createdAt: orders.createdAt,
          userId: orders.userId,
        })
        .from(orderItems)
        .innerJoin(orders, eq(orderItems.orderId, orders.id))
        .where(sql`${orderItems.gameId} = ${gameId} AND ${orders.status} = 'fulfilled'`);

      let totalRevenue = 0;
      const uniqueOwners = new Set<string>();
      const monthlyMap = new Map<string, number>(); // 'YYYY-MM' -> count

      results.forEach((row) => {
        totalRevenue += parseFloat(row.pricePaidEgp || '0');
        uniqueOwners.add(row.userId);

        if (row.createdAt) {
          const d = new Date(row.createdAt);
          const monthKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
          monthlyMap.set(monthKey, (monthlyMap.get(monthKey) || 0) + 1);
        }
      });

      const monthlyPurchases = Array.from(monthlyMap.entries())
        .map(([key, amount]) => {
          const [year, month] = key.split('-');
          return {
            year: parseInt(year, 10),
            month: parseInt(month, 10),
            amount,
          };
        })
        .sort((a, b) => (a.year !== b.year ? a.year - b.year : a.month - b.month));

      res.status(200).json({
        totalOwners: uniqueOwners.size,
        totalRevenueEgp: totalRevenue.toFixed(2),
        averageScore: 4.5, // Currently mocked as commerce doesn't store reviews
        lifetimePurchases: results.length,
        monthlyPurchases,
      });
    } catch (error) {
      console.error('Error fetching analytics:', error);
      res.status(500).json({ error: 'Failed to fetch analytics' });
    }
  }
);

export default router;
