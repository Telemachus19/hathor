import { Router, Response } from 'express';
import { and, eq, inArray } from 'drizzle-orm';
import { requireServiceAuth, AuthenticatedServiceRequest } from '../middleware/auth.js';
import { libraryDb } from '../infrastructure/db/client.js';
import { userLicenses } from '../infrastructure/db/schema.js';
import { randomUUID } from 'node:crypto';

// Explicitly type the Express Router to prevent compilation error TS2742
const router: Router = Router();

const checkOwnershipHandler = async (req: AuthenticatedServiceRequest, res: Response) => {
  const correlationId = (req.headers['x-correlation-id'] as string) || req.headers['correlation-id'] || randomUUID();
  const { userId, gameIds } = req.body;

  // Validate request parameters
  if (!userId || !gameIds || !Array.isArray(gameIds)) {
    return res.status(422).json({
      success: false,
      error: {
        code: 'VALIDATION_FAILED',
        message: 'userId and gameIds array are required',
        correlationId,
      },
    });
  }

  // If list of games to check is empty, return empty list immediately
  if (gameIds.length === 0) {
    return res.status(200).json({ ownedGameIds: [] });
  }

  try {
    // Query db user_licenses table to check which game IDs the user already owns
    const results = await libraryDb
      .select({ gameId: userLicenses.gameId })
      .from(userLicenses)
      .where(
        and(
          eq(userLicenses.userId, userId),
          inArray(userLicenses.gameId, gameIds)
        )
      );

    const ownedGameIds = results.map((r) => r.gameId);
    return res.status(200).json({ ownedGameIds });
  } catch (error) {
    console.error('Error checking library ownership:', error);
    return res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to check library ownership',
        correlationId,
      },
    });
  }
};

// Protect both paths using requireServiceAuth middleware to satisfy both OpenAPI spec and prompt details
router.post('/ownership-check', requireServiceAuth, checkOwnershipHandler);
router.post('/ownership', requireServiceAuth, checkOwnershipHandler);

export default router;
