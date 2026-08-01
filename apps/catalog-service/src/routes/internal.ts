import { Router, Response } from 'express';
import { eq, inArray } from 'drizzle-orm';
import { randomUUID } from 'node:crypto';
import { requireServiceAuth, AuthenticatedServiceRequest } from '../middleware/auth.js';
import { catalogDb } from '../infrastructure/db/client.js';
import { games } from '../infrastructure/db/schema.js';
import { formatPriceEgp } from '../utils/pricing.js';

const router: Router = Router();

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// GET /internal/v1/catalog/quotes/:gameId — Single Game Quote Lookup
router.get(
  '/quotes/:gameId',
  requireServiceAuth('catalog.quote.read'),
  async (req: AuthenticatedServiceRequest, res: Response) => {
    const correlationId =
      (req.headers['x-correlation-id'] as string) ||
      (req.headers['correlation-id'] as string) ||
      randomUUID();

    const { gameId } = req.params;

    if (!gameId || !UUID_REGEX.test(gameId)) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_FAILED',
          message: 'Invalid gameId format (must be a valid UUID)',
          correlationId,
        },
      });
    }

    try {
      const [game] = await catalogDb
        .select({
          id: games.id,
          title: games.title,
          priceEgp: games.priceEgp,
          status: games.status,
          updatedAt: games.updatedAt,
        })
        .from(games)
        .where(eq(games.id, gameId))
        .limit(1);

      if (!game) {
        return res.status(404).json({
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: `Game not found: ${gameId}`,
            correlationId,
          },
        });
      }

      const sellable = game.status === 'published';
      const priceEgp = formatPriceEgp(game.priceEgp);
      const priceVersion = game.updatedAt ? new Date(game.updatedAt).toISOString() : 'v1';

      return res.status(200).json({
        gameId: game.id,
        title: game.title,
        priceEgp,
        priceVersion,
        currency: 'EGP',
        sellable,
      });
    } catch (error) {
      console.error('Error fetching internal catalog quote:', error);
      return res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to fetch catalog quote',
          correlationId,
        },
      });
    }
  }
);

// POST /internal/v1/catalog/quotes — Batch Game Quote Lookup
router.post(
  '/quotes',
  requireServiceAuth('catalog.quote.read'),
  async (req: AuthenticatedServiceRequest, res: Response) => {
    const correlationId =
      (req.headers['x-correlation-id'] as string) ||
      (req.headers['correlation-id'] as string) ||
      randomUUID();

    const { gameIds } = req.body || {};

    if (!gameIds || !Array.isArray(gameIds) || gameIds.length === 0 || gameIds.length > 50) {
      return res.status(422).json({
        success: false,
        error: {
          code: 'VALIDATION_FAILED',
          message: 'gameIds must be a non-empty array of max 50 UUIDs',
          correlationId,
        },
      });
    }

    const invalidId = gameIds.find((id) => typeof id !== 'string' || !UUID_REGEX.test(id));
    if (invalidId) {
      return res.status(422).json({
        success: false,
        error: {
          code: 'VALIDATION_FAILED',
          message: `Invalid UUID format in gameIds array: ${invalidId}`,
          correlationId,
        },
      });
    }

    try {
      const foundGames = await catalogDb
        .select({
          id: games.id,
          title: games.title,
          priceEgp: games.priceEgp,
          status: games.status,
          updatedAt: games.updatedAt,
        })
        .from(games)
        .where(inArray(games.id, gameIds));

      const gameMap = new Map(foundGames.map((g) => [g.id, g]));

      const items = gameIds.map((id) => {
        const game = gameMap.get(id);
        if (!game) {
          return {
            gameId: id,
            title: 'Unknown',
            sellable: false,
            priceEgp: '0.00',
            currency: 'EGP',
            priceVersion: 'v1',
          };
        }

        return {
          gameId: game.id,
          title: game.title,
          sellable: game.status === 'published',
          priceEgp: formatPriceEgp(game.priceEgp),
          currency: 'EGP',
          priceVersion: game.updatedAt ? new Date(game.updatedAt).toISOString() : 'v1',
        };
      });

      return res.status(200).json({
        quoteId: randomUUID(),
        expiresAt: new Date(Date.now() + 15 * 60 * 1000).toISOString(),
        items,
      });
    } catch (error) {
      console.error('Error batch fetching internal catalog quotes:', error);
      return res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to fetch catalog quotes batch',
          correlationId,
        },
      });
    }
  }
);

export default router;
