import { Router, Response } from 'express';
import { and, eq } from 'drizzle-orm';
import { requireUserAuth, AuthenticatedUserRequest } from '../middleware/auth.js';
import { libraryDb } from '../infrastructure/db/client.js';
import { userLicenses } from '../infrastructure/db/schema.js';

const router: Router = Router();

// GET /inventory/check/:gameId (OpenAPI spec: checkLibraryOwnership)
router.get(
  '/check/:gameId',
  requireUserAuth,
  async (req: AuthenticatedUserRequest, res: Response) => {
    const userId = req.user!.id;
    const { gameId } = req.params;

    try {
      const [license] = await libraryDb
        .select({ gameId: userLicenses.gameId })
        .from(userLicenses)
        .where(and(eq(userLicenses.userId, userId), eq(userLicenses.gameId, gameId)))
        .limit(1);

      return res.status(200).json({
        gameId,
        owned: Boolean(license),
      });
    } catch (error) {
      console.error(`Error checking ownership for game ${gameId}:`, error);
      return res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to check game ownership',
        },
      });
    }
  }
);

// GET /inventory/apps (OpenAPI spec: listLibraryGames)
router.get('/apps', requireUserAuth, async (req: AuthenticatedUserRequest, res: Response) => {
  const userId = req.user!.id;

  try {
    const licenses = await libraryDb
      .select()
      .from(userLicenses)
      .where(eq(userLicenses.userId, userId));

    return res.status(200).json({
      success: true,
      data: {
        items: licenses.map((l) => ({
          gameId: l.gameId,
          sourceOrderId: l.sourceOrderId,
          pricePaidEgp: l.pricePaidEgp,
          currency: l.currency,
          acquiredAt: l.acquiredAt ? l.acquiredAt.toISOString() : new Date().toISOString(),
        })),
      },
    });
  } catch (error) {
    console.error('Error fetching user library apps:', error);
    return res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to fetch library games',
      },
    });
  }
});

export default router;
