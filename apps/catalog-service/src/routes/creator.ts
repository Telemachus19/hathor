import { Router, Response } from 'express';
import { eq, sql } from 'drizzle-orm';
import { randomUUID } from 'node:crypto';
import { requireAuth, requireRole, AuthenticatedRequest } from '../middleware/auth.js';
import { catalogDb } from '../infrastructure/db/client.js';
import { games, gameStatusTransitions } from '../infrastructure/db/schema.js';
import {
  isValidTransition,
  isCreatorAllowedTargetStatus,
  VALID_GAME_STATUSES,
} from '../domain/stateMachine.js';

const router: Router = Router();

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// PATCH /creator/games/:gameId/status — Creator status transition (e.g. submitting for review)
router.patch(
  '/games/:gameId/status',
  requireAuth,
  requireRole('creator'),
  async (req: AuthenticatedRequest, res: Response) => {
    const correlationId =
      (req.headers['x-correlation-id'] as string) ||
      (req.headers['correlation-id'] as string) ||
      randomUUID();
    const { gameId } = req.params;
    const { status, reason } = req.body || {};

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

    if (!status || !VALID_GAME_STATUSES.includes(status)) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_FAILED',
          message: `Invalid status provided. Must be one of: ${VALID_GAME_STATUSES.join(', ')}`,
          correlationId,
        },
      });
    }

    // Creator target status restriction check (stateless — no DB needed)
    if (!isCreatorAllowedTargetStatus(status)) {
      return res.status(403).json({
        success: false,
        error: {
          code: 'FORBIDDEN',
          message: `Creators are not allowed to transition status directly to '${status}'. Only Admins can set status to '${status}'.`,
          correlationId,
        },
      });
    }

    try {
      const result = await catalogDb.transaction(async (tx) => {
        // SELECT ... FOR UPDATE acquires a row-level lock to prevent
        // concurrent status transitions from validating against stale data
        const [existingGame] = await tx
          .select()
          .from(games)
          .where(eq(games.id, gameId))
          .limit(1)
          .for('update');

        if (!existingGame) {
          return { error: 'NOT_FOUND' as const };
        }

        // Verify creator ownership
        if (existingGame.creatorId !== req.user!.id) {
          return { error: 'FORBIDDEN_OWNERSHIP' as const };
        }

        const priorStatus = existingGame.status || 'draft';

        // Verify valid state machine transition
        if (!isValidTransition(priorStatus, status)) {
          return { error: 'CONFLICT' as const, priorStatus };
        }

        await tx
          .update(games)
          .set({
            status,
            updatedAt: new Date(),
          })
          .where(eq(games.id, gameId));

        await tx.insert(gameStatusTransitions).values({
          gameId,
          actorId: req.user!.id,
          priorStatus,
          nextStatus: status,
          reason: reason || null,
          correlationId,
        });

        return { error: null as null };
      });

      if (result.error === 'NOT_FOUND') {
        return res.status(404).json({
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: `Game not found: ${gameId}`,
            correlationId,
          },
        });
      }

      if (result.error === 'FORBIDDEN_OWNERSHIP') {
        return res.status(403).json({
          success: false,
          error: {
            code: 'FORBIDDEN',
            message: 'You do not have permission to modify this game',
            correlationId,
          },
        });
      }

      if (result.error === 'CONFLICT') {
        return res.status(409).json({
          success: false,
          error: {
            code: 'CONFLICT',
            message: `Disallowed status transition from '${result.priorStatus}' to '${status}'`,
            correlationId,
          },
        });
      }

      return res.status(204).send();
    } catch (error) {
      console.error('Error in creator game status transition:', error);
      return res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to update game status',
          correlationId,
        },
      });
    }
  }
);

export default router;
