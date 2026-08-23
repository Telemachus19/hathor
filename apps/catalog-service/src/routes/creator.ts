import { Router, Response } from 'express';
import { eq, sql } from 'drizzle-orm';
import { randomUUID } from 'node:crypto';
import { requireAuth, requireRole, AuthenticatedRequest } from '../middleware/auth.js';
import { catalogDb } from '../infrastructure/db/client.js';
import { games, gameStatusTransitions, genres, tags, gameTags } from '../infrastructure/db/schema.js';
import {
  isValidTransition,
  isCreatorAllowedTargetStatus,
  VALID_GAME_STATUSES,
} from '../domain/stateMachine.js';
import { validateThemeAgainstDocument } from '../utils/themeValidator.js';

const router: Router = Router();

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function slugifyTitle(title: string): string {
  const baseSlug = title
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-')
    .replace(/^-+|-+$/g, '');
  return baseSlug || 'game-' + Date.now().toString(36);
}

/**
 * GET /creator/genres
 * Returns all catalog genres for creators.
 */
router.get(
  '/genres',
  requireAuth,
  requireRole('creator'),
  async (_req: AuthenticatedRequest, res: Response) => {
    try {
      const items = await catalogDb.select().from(genres).orderBy(genres.name);
      return res.status(200).json(items);
    } catch (error) {
      return res.status(500).json({ error: { code: 'INTERNAL_SERVER_ERROR', message: 'Failed to list genres' } });
    }
  }
);

/**
 * GET /creator/tags
 * Returns all catalog tags for creators.
 */
router.get(
  '/tags',
  requireAuth,
  requireRole('creator'),
  async (_req: AuthenticatedRequest, res: Response) => {
    try {
      const items = await catalogDb.select().from(tags).orderBy(tags.name);
      return res.status(200).json(items);
    } catch (error) {
      return res.status(500).json({ error: { code: 'INTERNAL_SERVER_ERROR', message: 'Failed to list tags' } });
    }
  }
);

/**
 * PUT /creator/games/:gameId/theme
 * Creator Authorization & Ownership Verification (creator_id == caller_id).
 * Strictly looks up game by gameId parameter.
 * Rejects unauthorized access attempts with HTTP 403 Forbidden to prevent cross-creator IDOR.
 */
router.put(
  '/games/:gameId/theme',
  requireAuth,
  requireRole('creator'),
  async (req: AuthenticatedRequest, res: Response) => {
    const correlationId =
      (req.headers['x-correlation-id'] as string) ||
      (req.headers['correlation-id'] as string) ||
      '';

    try {
      const callerId = req.user!.id;
      const { gameId } = req.params;

      if (!gameId || typeof gameId !== 'string' || !gameId.trim()) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_FAILED',
            message: 'Game ID or slug is required',
            correlationId,
          },
        });
      }

      const isUuid = UUID_REGEX.test(gameId);
      const [game] = await catalogDb
        .select()
        .from(games)
        .where(isUuid ? eq(games.id, gameId) : eq(games.slug, gameId))
        .limit(1);

      if (!game) {
        return res.status(404).json({
          success: false,
          error: {
            code: 'GAME_NOT_FOUND',
            message: `Game not found for identifier: ${gameId}`,
            correlationId,
          },
        });
      }


      // Enforce creator ownership (creator_id == caller_id)
      if (game.creatorId !== callerId) {
        return res.status(403).json({
          success: false,
          error: {
            code: 'FORBIDDEN',
            message: 'Creator ownership verification failed: caller is not the owner of this game',
            correlationId,
          },
        });
      }

      const themePayload = req.body || {};

      // Validate theme JSON payload against specification & security rules
      const validationResult = validateThemeAgainstDocument(themePayload);
      if (!validationResult.valid) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_FAILED',
            message: 'Theme JSON validation failed',
            details: validationResult.errors,
            correlationId,
          },
        });
      }

      await catalogDb
        .update(games)
        .set({
          pageTheme: themePayload,
          updatedAt: new Date(),
        })
        .where(eq(games.id, game.id));

      return res.status(200).json({
        success: true,
        data: {
          gameId: game.id,
          slug: game.slug,
          pageTheme: themePayload,
        },
      });
    } catch (error) {
      console.error('Error updating game theme:', error);
      return res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to update game theme',
          correlationId,
        },
      });
    }
  }
);

/**
 * POST /creator/games
 * Creates a draft game associated with the authenticated creator (creator_id == caller_id).
 * Enforces status = "draft".
 */
router.post(
  '/games',
  requireAuth,
  requireRole('creator'),
  async (req: AuthenticatedRequest, res: Response) => {
    const correlationId =
      (req.headers['x-correlation-id'] as string) ||
      (req.headers['correlation-id'] as string) ||
      '';

    try {
      const callerId = req.user!.id;
      const {
        title,
        shortDescription,
        shortDesc,
        fullDescription,
        priceEgp,
        discountPercent,
        genreId,
        genre: genreName,
        tags: tagList,
        bannerUrl,
        screenshots,
        trailerUrl,
        systemRequirements,
        systemReqs,
        slug: customSlug,
      } = req.body || {};

      if (!title || typeof title !== 'string' || !title.trim()) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'BAD_REQUEST',
            message: 'Game title is required',
            correlationId,
          },
        });
      }

      const baseSlug =
        customSlug && typeof customSlug === 'string' && customSlug.trim()
          ? slugifyTitle(customSlug)
          : slugifyTitle(title);

      const uniqueSuffix = Date.now().toString(36).slice(-4);
      const slug = `${baseSlug}-${uniqueSuffix}`;

      let resolvedGenreId = genreId || null;
      if (!resolvedGenreId && genreName && typeof genreName === 'string') {
        const [foundGenre] = await catalogDb.select().from(genres).where(eq(genres.name, genreName.trim())).limit(1);
        if (foundGenre) resolvedGenreId = foundGenre.id;
      }

      const [newGame] = await catalogDb
        .insert(games)
        .values({
          creatorId: callerId,
          title: title.trim(),
          slug,
          shortDescription: (shortDescription || shortDesc || title).trim(),
          fullDescription: (fullDescription || shortDescription || shortDesc || title).trim(),
          priceEgp: String(priceEgp !== undefined && priceEgp !== '' ? priceEgp : '0.00'),
          discountPercent: Number(discountPercent || 0),
          genreId: resolvedGenreId,
          bannerUrl: bannerUrl || null,
          screenshots: Array.isArray(screenshots) ? screenshots : [],
          trailerUrl: trailerUrl || null,
          systemRequirements: systemRequirements || systemReqs || {},
          pageTheme: {}, // Empty theme initially
          status: 'draft', // Mandatory draft status
        })
        .returning();

      // Insert tags if provided
      if (Array.isArray(tagList) && newGame) {
        for (const tagNameOrSlug of tagList) {
          const val = typeof tagNameOrSlug === 'string' ? tagNameOrSlug.trim() : (tagNameOrSlug.name || tagNameOrSlug.slug || '').trim();
          if (!val) continue;
          const [foundTag] = await catalogDb.select().from(tags).where(sql`lower(${tags.name}) = lower(${val}) or lower(${tags.slug}) = lower(${val})`).limit(1);
          if (foundTag) {
            await catalogDb.insert(gameTags).values({ gameId: newGame.id, tagId: foundTag.id }).onConflictDoNothing();
          }
        }
      }

      return res.status(201).json({
        success: true,
        data: newGame,
      });
    } catch (error) {
      console.error('Error creating draft game:', error);
      return res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to create draft game',
          correlationId,
        },
      });
    }
  }
);

/**
 * GET /creator/games
 * List all games belonging to the authenticated creator.
 */
router.get(
  '/games',
  requireAuth,
  requireRole('creator'),
  async (req: AuthenticatedRequest, res: Response) => {
    const correlationId = req.headers['x-correlation-id'] as string || randomUUID();

    try {
      const callerId = req.user!.id;
      
      const creatorGames = await catalogDb
        .select()
        .from(games)
        .where(eq(games.creatorId, callerId));

      const genreList = await catalogDb.select().from(genres);
      const genreMap = new Map(genreList.map((g) => [g.id, g]));

      return res.status(200).json(
        creatorGames.map(game => ({
          id: game.id,
          title: game.title,
          slug: game.slug,
          shortDescription: game.shortDescription,
          fullDescription: game.fullDescription,
          priceEgp: game.priceEgp,
          discountPercent: game.discountPercent,
          status: game.status,
          genreId: game.genreId,
          genre: game.genreId ? genreMap.get(game.genreId) || null : null,
          systemRequirements: game.systemRequirements,
          pageTheme: game.pageTheme,
          bannerUrl: game.bannerUrl,
          screenshots: game.screenshots,
          trailerUrl: game.trailerUrl,
          createdAt: game.createdAt?.toISOString(),
          updatedAt: game.updatedAt?.toISOString()
        }))
      );
    } catch (error) {
      console.error('Error fetching creator games:', error);
      return res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to fetch creator games',
          correlationId,
        },
      });
    }
  }
);

/**
 * GET /creator/games/:gameId
 * Fetches single game details with genre and tags for creator.
 */
router.get(
  '/games/:gameId',
  requireAuth,
  requireRole('creator'),
  async (req: AuthenticatedRequest, res: Response) => {
    const correlationId = (req.headers['x-correlation-id'] as string) || (req.headers['correlation-id'] as string) || randomUUID();

    try {
      const callerId = req.user!.id;
      const { gameId } = req.params;

      if (!gameId || !UUID_REGEX.test(gameId)) {
        return res.status(400).json({
          error: { code: 'VALIDATION_FAILED', message: 'Invalid gameId format', correlationId },
        });
      }

      const [game] = await catalogDb.select().from(games).where(eq(games.id, gameId)).limit(1);

      if (!game) {
        return res.status(404).json({
          error: { code: 'NOT_FOUND', message: `Game not found: ${gameId}`, correlationId },
        });
      }

      if (game.creatorId !== callerId) {
        return res.status(403).json({
          error: { code: 'FORBIDDEN', message: 'Not authorized to view this game', correlationId },
        });
      }

      let genreObj = null;
      if (game.genreId) {
        const [g] = await catalogDb.select().from(genres).where(eq(genres.id, game.genreId)).limit(1);
        genreObj = g || null;
      }

      const gameTagRows = await catalogDb
        .select({ id: tags.id, name: tags.name, slug: tags.slug })
        .from(gameTags)
        .innerJoin(tags, eq(gameTags.tagId, tags.id))
        .where(eq(gameTags.gameId, game.id));

      return res.status(200).json({
        id: game.id,
        title: game.title,
        slug: game.slug,
        shortDescription: game.shortDescription,
        fullDescription: game.fullDescription,
        priceEgp: game.priceEgp,
        discountPercent: game.discountPercent,
        status: game.status,
        genreId: game.genreId,
        genre: genreObj,
        tags: gameTagRows,
        systemRequirements: game.systemRequirements,
        pageTheme: game.pageTheme,
        bannerUrl: game.bannerUrl,
        screenshots: game.screenshots,
        trailerUrl: game.trailerUrl,
        createdAt: game.createdAt?.toISOString(),
        updatedAt: game.updatedAt?.toISOString(),
      });
    } catch (error) {
      console.error('Error fetching creator game details:', error);
      return res.status(500).json({
        error: { code: 'INTERNAL_SERVER_ERROR', message: 'Failed to fetch game details', correlationId },
      });
    }
  }
);

/**
 * PUT /creator/games/:gameId
 * Updates game metadata for creator.
 */
router.put(
  '/games/:gameId',
  requireAuth,
  requireRole('creator'),
  async (req: AuthenticatedRequest, res: Response) => {
    const correlationId = (req.headers['x-correlation-id'] as string) || (req.headers['correlation-id'] as string) || randomUUID();

    try {
      const callerId = req.user!.id;
      const { gameId } = req.params;

      if (!gameId || !UUID_REGEX.test(gameId)) {
        return res.status(400).json({
          error: { code: 'VALIDATION_FAILED', message: 'Invalid gameId format', correlationId },
        });
      }

      const [game] = await catalogDb.select().from(games).where(eq(games.id, gameId)).limit(1);

      if (!game) {
        return res.status(404).json({
          error: { code: 'NOT_FOUND', message: `Game not found: ${gameId}`, correlationId },
        });
      }

      if (game.creatorId !== callerId) {
        return res.status(403).json({
          error: { code: 'FORBIDDEN', message: 'Not authorized to modify this game', correlationId },
        });
      }

      const {
        title,
        shortDescription,
        shortDesc,
        fullDescription,
        priceEgp,
        discountPercent,
        genreId,
        genre: genreName,
        tags: tagList,
        bannerUrl,
        screenshots,
        trailerUrl,
        systemRequirements,
        systemReqs,
      } = req.body || {};

      let resolvedGenreId = genreId !== undefined ? genreId : game.genreId;
      if (genreName && typeof genreName === 'string') {
        const [foundGenre] = await catalogDb.select().from(genres).where(eq(genres.name, genreName.trim())).limit(1);
        if (foundGenre) resolvedGenreId = foundGenre.id;
      }

      const updatedFields: any = {
        updatedAt: new Date(),
      };

      if (title && typeof title === 'string') updatedFields.title = title.trim();
      if (shortDescription !== undefined || shortDesc !== undefined) {
        updatedFields.shortDescription = (shortDescription || shortDesc || '').trim();
      }
      if (fullDescription !== undefined) updatedFields.fullDescription = fullDescription.trim();
      if (priceEgp !== undefined && priceEgp !== '') updatedFields.priceEgp = String(priceEgp);
      if (discountPercent !== undefined) updatedFields.discountPercent = Number(discountPercent);
      if (resolvedGenreId !== undefined) updatedFields.genreId = resolvedGenreId;
      if (bannerUrl !== undefined) updatedFields.bannerUrl = bannerUrl || null;
      if (screenshots !== undefined) updatedFields.screenshots = Array.isArray(screenshots) ? screenshots : [];
      if (trailerUrl !== undefined) updatedFields.trailerUrl = trailerUrl || null;
      if (systemRequirements !== undefined || systemReqs !== undefined) {
        updatedFields.systemRequirements = systemRequirements || systemReqs || {};
      }

      const [updatedGame] = await catalogDb
        .update(games)
        .set(updatedFields)
        .where(eq(games.id, gameId))
        .returning();

      if (Array.isArray(tagList)) {
        await catalogDb.delete(gameTags).where(eq(gameTags.gameId, gameId));
        for (const tagNameOrSlug of tagList) {
          const val = typeof tagNameOrSlug === 'string' ? tagNameOrSlug.trim() : (tagNameOrSlug.name || tagNameOrSlug.slug || '').trim();
          if (!val) continue;
          const [foundTag] = await catalogDb.select().from(tags).where(sql`lower(${tags.name}) = lower(${val}) or lower(${tags.slug}) = lower(${val})`).limit(1);
          if (foundTag) {
            await catalogDb.insert(gameTags).values({ gameId, tagId: foundTag.id }).onConflictDoNothing();
          }
        }
      }

      return res.status(200).json({
        success: true,
        data: updatedGame,
      });
    } catch (error) {
      console.error('Error updating creator game:', error);
      return res.status(500).json({
        error: { code: 'INTERNAL_SERVER_ERROR', message: 'Failed to update game', correlationId },
      });
    }
  }
);

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

/**
 * POST /creator/games/:gameId/ai/theme-proposals
 * Returns a Mock AI theme proposal for HITL flow demonstration.
 */
router.post(
  '/games/:gameId/ai/theme-proposals',
  requireAuth,
  requireRole('creator'),
  async (req: AuthenticatedRequest, res: Response) => {
    const correlationId =
      (req.headers['x-correlation-id'] as string) ||
      (req.headers['correlation-id'] as string) ||
      randomUUID();

    try {
      const { gameId } = req.params;
      const { prompt, currentTheme } = req.body || {};

      if (!gameId || !UUID_REGEX.test(gameId)) {
        return res.status(400).json({
          error: { code: 'VALIDATION_FAILED', message: 'Invalid gameId format', correlationId },
        });
      }

      if (!prompt || typeof prompt !== 'string') {
        return res.status(400).json({
          error: { code: 'VALIDATION_FAILED', message: 'prompt is required', correlationId },
        });
      }

      // Verify game exists and is owned by caller
      const [game] = await catalogDb.select().from(games).where(eq(games.id, gameId)).limit(1);

      if (!game) {
        return res.status(404).json({
          error: { code: 'NOT_FOUND', message: 'Game not found', correlationId },
        });
      }

      if (game.creatorId !== req.user!.id) {
        return res.status(403).json({
          error: { code: 'FORBIDDEN', message: 'Not authorized to modify this game', correlationId },
        });
      }

      // Return a Mock AI proposal
      const mockProposal = {
        summary: `I've updated your theme to be more engaging and darker based on your request: "${prompt}". I adjusted the main colors and added a new hero section.`,
        patch: [
          {
            op: "replace",
            path: "/colorPalette/primary",
            value: "#ff6b00"
          },
          {
            op: "replace",
            path: "/colorPalette/background",
            value: "#121212"
          },
          {
            op: "replace",
            path: "/typography/headingFont",
            value: "Inter, sans-serif"
          }
        ]
      };

      return res.status(200).json(mockProposal);
    } catch (error) {
      console.error('Error generating AI theme proposal:', error);
      return res.status(500).json({
        error: {
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to generate AI theme proposal',
          correlationId,
        },
      });
    }
  }
);

/**
 * GET /creator/games/:gameId/analytics
 * Fetches cross-service analytics data from commerce-service for a game owned by the caller.
 */
router.get(
  '/games/:gameId/analytics',
  requireAuth,
  requireRole('creator'),
  async (req: AuthenticatedRequest, res: Response) => {
    const correlationId =
      (req.headers['x-correlation-id'] as string) ||
      (req.headers['correlation-id'] as string) ||
      randomUUID();

    try {
      const { gameId } = req.params;

      if (!gameId || !UUID_REGEX.test(gameId)) {
        return res.status(400).json({
          error: { code: 'VALIDATION_FAILED', message: 'Invalid gameId format', correlationId },
        });
      }

      // Verify game exists and is owned by caller
      const [game] = await catalogDb.select().from(games).where(eq(games.id, gameId)).limit(1);

      if (!game) {
        return res.status(404).json({
          error: { code: 'NOT_FOUND', message: 'Game not found', correlationId },
        });
      }

      if (game.creatorId !== req.user!.id) {
        return res.status(403).json({
          error: { code: 'FORBIDDEN', message: 'Not authorized to view analytics for this game', correlationId },
        });
      }

      // We need to fetch an internal token to call commerce-service
      let internalToken = '';
      try {
        const tokenRes = await fetch('http://auth-service:5001/internal/v1/service-tokens', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Hathor-Service-Credential': process.env.SERVICE_CREDENTIAL || 'catalog-service-secret',
          },
          body: JSON.stringify({ audience: 'commerce-service' }),
        });
        if (tokenRes.ok) {
          const tokenData = await tokenRes.json();
          internalToken = tokenData.accessToken;
        } else {
          console.warn('Failed to obtain internal token for commerce-service. Status:', tokenRes.status);
        }
      } catch (err) {
        console.warn('Error fetching service token:', err);
      }

      // Fetch analytics from commerce-service
      try {
        const analyticsRes = await fetch(`http://commerce-service:5003/internal/v1/analytics/${gameId}`, {
          headers: {
            'Authorization': `Bearer ${internalToken}`,
            'X-Correlation-ID': correlationId,
          },
        });

        if (analyticsRes.ok) {
          const analyticsData = await analyticsRes.json();
          return res.status(200).json(analyticsData);
        } else {
          console.warn('Commerce service analytics fetch failed with status:', analyticsRes.status);
          // Return empty structure if commerce fails
          return res.status(200).json({
            totalOwners: 0,
            totalRevenueEgp: '0.00',
            averageScore: 0,
            lifetimePurchases: 0,
            monthlyPurchases: [],
          });
        }
      } catch (err) {
        console.warn('Error calling commerce-service analytics:', err);
        return res.status(200).json({
          totalOwners: 0,
          totalRevenueEgp: '0.00',
          averageScore: 0,
          lifetimePurchases: 0,
          monthlyPurchases: [],
        });
      }
    } catch (error) {
      console.error('Error in GET /creator/games/:gameId/analytics:', error);
      return res.status(500).json({
        error: { code: 'INTERNAL_SERVER_ERROR', message: 'Failed to fetch analytics', correlationId },
      });
    }
  }
);

/**
 * GET /creator/analytics
 * Aggregates cross-service analytics for all games owned by the creator.
 */
router.get(
  '/analytics',
  requireAuth,
  requireRole('creator'),
  async (req: AuthenticatedRequest, res: Response) => {
    const correlationId =
      (req.headers['x-correlation-id'] as string) ||
      (req.headers['correlation-id'] as string) ||
      randomUUID();

    try {
      const callerId = req.user!.id;
      const creatorGames = await catalogDb
        .select({ id: games.id })
        .from(games)
        .where(eq(games.creatorId, callerId));

      const gameIds = creatorGames.map((g) => g.id);

      if (gameIds.length === 0) {
        return res.status(200).json({
          totalOwners: 0,
          totalRevenueEgp: '0.00',
          averageScore: 0,
          lifetimePurchases: 0,
          monthlyPurchases: [],
        });
      }

      // Fetch internal token
      let internalToken = '';
      try {
        const tokenRes = await fetch('http://auth-service:5001/internal/v1/service-tokens', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Hathor-Service-Credential': process.env.SERVICE_CREDENTIAL || 'catalog-service-secret',
          },
          body: JSON.stringify({ audience: 'commerce-service' }),
        });
        if (tokenRes.ok) {
          const tokenData = await tokenRes.json();
          internalToken = tokenData.accessToken;
        }
      } catch (err) {}

      // For simplicity in this demo, fetch analytics sequentially for each game
      // In production, an internal batch endpoint /internal/v1/analytics?gameIds=... is preferred
      let totalOwners = 0;
      let totalRevenue = 0;
      let lifetimePurchases = 0;
      const monthlyMap = new Map<string, number>();

      for (const gameId of gameIds) {
        try {
          const analyticsRes = await fetch(`http://commerce-service:5003/internal/v1/analytics/${gameId}`, {
            headers: { Authorization: `Bearer ${internalToken}` },
          });
          if (analyticsRes.ok) {
            const data = await analyticsRes.json();
            totalOwners += data.totalOwners;
            totalRevenue += parseFloat(data.totalRevenueEgp);
            lifetimePurchases += data.lifetimePurchases;
            for (const mp of data.monthlyPurchases) {
              const k = `${mp.year}-${mp.month}`;
              monthlyMap.set(k, (monthlyMap.get(k) || 0) + mp.amount);
            }
          }
        } catch (err) {}
      }

      const monthlyPurchases = Array.from(monthlyMap.entries()).map(([key, amount]) => {
        const [year, month] = key.split('-');
        return {
          year: parseInt(year, 10),
          month: parseInt(month, 10),
          amount,
        };
      }).sort((a, b) => a.year !== b.year ? a.year - b.year : a.month - b.month);

      return res.status(200).json({
        totalOwners,
        totalRevenueEgp: totalRevenue.toFixed(2),
        averageScore: 4.5, // Mocked overall
        lifetimePurchases,
        monthlyPurchases,
      });

    } catch (error) {
      console.error('Error fetching creator analytics:', error);
      return res.status(500).json({ error: { message: 'Internal server error' } });
    }
  }
);

export default router;
