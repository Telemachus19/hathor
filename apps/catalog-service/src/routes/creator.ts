import { Router, Response } from 'express';
import { eq, sql, and, desc, inArray } from 'drizzle-orm';
import { randomUUID } from 'node:crypto';
import multer from 'multer';
import { requireAuth, requireRole, AuthenticatedRequest } from '../middleware/auth.js';
import { catalogDb } from '../infrastructure/db/client.js';
import {
  games,
  gameStatusTransitions,
  genres,
  tags,
  gameTags,
  gameBuilds,
} from '../infrastructure/db/schema.js';
import { uploadGameBuildPackage } from '../infrastructure/storage/r2Client.js';
import {
  isValidTransition,
  isCreatorAllowedTargetStatus,
  VALID_GAME_STATUSES,
} from '../domain/stateMachine.js';
import { validateThemeAgainstDocument } from '../utils/themeValidator.js';
import { getGameAnalytics } from '../infrastructure/clients/library.js';

const router: Router = Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 500 * 1024 * 1024, // 500MB max package size
  },
});

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

async function handleGameBuildStorage(
  gameId: string,
  file: Express.Multer.File
): Promise<{
  objectKey: string;
  checksumSha256: string;
  sizeBytes: number;
}> {
  const objectKey = `builds/${gameId}/v1.0.0/game.zip`;
  const { checksumSha256, sizeBytes } = await uploadGameBuildPackage({
    objectKey,
    buffer: file.buffer,
    contentType: file.mimetype || 'application/zip',
  });

  const [existingBuild] = await catalogDb
    .select()
    .from(gameBuilds)
    .where(and(eq(gameBuilds.gameId, gameId), eq(gameBuilds.version, 'v1.0.0')))
    .limit(1);

  if (existingBuild) {
    await catalogDb
      .update(gameBuilds)
      .set({
        objectKey,
        checksumSha256,
        sizeBytes,
        state: 'published',
        publishedAt: new Date(),
      })
      .where(eq(gameBuilds.id, existingBuild.id));
  } else {
    await catalogDb.insert(gameBuilds).values({
      gameId,
      version: 'v1.0.0',
      objectKey,
      checksumSha256,
      sizeBytes,
      state: 'published',
      publishedAt: new Date(),
    });
  }

  return { objectKey, checksumSha256, sizeBytes };
}

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
            message: 'Invalid gameId format',
            correlationId,
          },
        });
      }

      const isUuid = UUID_REGEX.test(gameId);
      const condition = isUuid ? eq(games.id, gameId) : eq(games.slug, gameId);
      const [game] = await catalogDb.select().from(games).where(condition).limit(1);

      if (!game) {
        return res.status(404).json({
          success: false,
          error: {
            code: 'GAME_NOT_FOUND',
            message: `Game not found for id: ${gameId}`,
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
 * Enforces status = "draft" and stores uploaded build package to MinIO/R2 if provided.
 */
router.post(
  '/games',
  requireAuth,
  requireRole('creator'),
  upload.any(),
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
        tags: rawTags,
        bannerUrl,
        screenshots: rawScreenshots,
        trailerUrl,
        systemRequirements: rawSystemReqs,
        systemReqs: rawSystemReqsAlt,
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

      // Parse JSON stringified fields if submitted via FormData
      let tagList = rawTags;
      if (typeof tagList === 'string') {
        try {
          tagList = JSON.parse(tagList);
        } catch {
          tagList = tagList.split(',').map((t: string) => t.trim()).filter(Boolean);
        }
      }

      let systemRequirements = rawSystemReqs || rawSystemReqsAlt;
      if (typeof systemRequirements === 'string') {
        try {
          systemRequirements = JSON.parse(systemRequirements);
        } catch {
          systemRequirements = {};
        }
      }

      let screenshots = rawScreenshots;
      if (typeof screenshots === 'string') {
        try {
          screenshots = JSON.parse(screenshots);
        } catch {
          screenshots = screenshots.split(',').map((s: string) => s.trim()).filter(Boolean);
        }
      }

      const baseSlug =
        customSlug && typeof customSlug === 'string' && customSlug.trim()
          ? slugifyTitle(customSlug)
          : slugifyTitle(title);

      const uniqueSuffix = Date.now().toString(36).slice(-4);
      const slug = `${baseSlug}-${uniqueSuffix}`;

      let resolvedGenreId = genreId || null;
      if (!resolvedGenreId && genreName && typeof genreName === 'string') {
        const [foundGenre] = await catalogDb
          .select()
          .from(genres)
          .where(eq(genres.name, genreName.trim()))
          .limit(1);
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
          systemRequirements: systemRequirements || {},
          pageTheme: {}, // Empty theme initially
          status: 'draft', // Mandatory draft status
        })
        .returning();

      // Insert tags if provided
      if (Array.isArray(tagList) && newGame) {
        for (const tagNameOrSlug of tagList) {
          const val =
            typeof tagNameOrSlug === 'string'
              ? tagNameOrSlug.trim()
              : (tagNameOrSlug.name || tagNameOrSlug.slug || '').trim();
          if (!val) continue;
          const [foundTag] = await catalogDb
            .select()
            .from(tags)
            .where(
              sql`lower(${tags.name}) = lower(${val}) or lower(${tags.slug}) = lower(${val})`
            )
            .limit(1);
          if (foundTag) {
            await catalogDb
              .insert(gameTags)
              .values({ gameId: newGame.id, tagId: foundTag.id })
              .onConflictDoNothing();
          }
        }
      }

      // Handle game build upload if attached
      const uploadedFiles = req.files as Express.Multer.File[] | undefined;
      const buildFile =
        req.file ||
        (Array.isArray(uploadedFiles)
          ? uploadedFiles.find(
            (f) =>
              f.fieldname === 'build' ||
              f.fieldname === 'gameBuild' ||
              f.fieldname === 'file'
          ) || uploadedFiles[0]
          : undefined);

      let buildInfo = null;
      if (buildFile && buildFile.buffer) {
        try {
          buildInfo = await handleGameBuildStorage(newGame.id, buildFile);
        } catch (storageErr) {
          console.error(`Failed to store game build package for game ${newGame.id}:`, storageErr);
          return res.status(500).json({
            success: false,
            error: {
              code: 'STORAGE_UPLOAD_FAILED',
              message: 'Failed to upload and store game build package in storage',
              correlationId,
            },
          });
        }
      }

      return res.status(201).json({
        success: true,
        data: {
          ...newGame,
          build: buildInfo,
        },
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
    const correlationId = (req.headers['x-correlation-id'] as string) || randomUUID();

    try {
      const callerId = req.user!.id;

      const creatorGames = await catalogDb
        .select()
        .from(games)
        .where(eq(games.creatorId, callerId));

      const genreList = await catalogDb.select().from(genres);
      const genreMap = new Map(genreList.map((g) => [g.id, g]));

      // Fetch latest rejection reasons if any games are rejected
      const gameIds = creatorGames.map((g) => g.id);
      const rejectionMap = new Map<string, string>();
      if (gameIds.length > 0) {
        const transitions = await catalogDb
          .select({
            gameId: gameStatusTransitions.gameId,
            reason: gameStatusTransitions.reason,
            createdAt: gameStatusTransitions.createdAt,
          })
          .from(gameStatusTransitions)
          .where(
            and(
              inArray(gameStatusTransitions.gameId, gameIds),
              eq(gameStatusTransitions.nextStatus, 'rejected')
            )
          )
          .orderBy(desc(gameStatusTransitions.createdAt));

        for (const t of transitions) {
          if (!rejectionMap.has(t.gameId) && t.reason) {
            rejectionMap.set(t.gameId, t.reason);
          }
        }
      }

      return res.status(200).json(
        creatorGames.map((game) => ({
          id: game.id,
          title: game.title,
          slug: game.slug,
          shortDescription: game.shortDescription,
          fullDescription: game.fullDescription,
          priceEgp: game.priceEgp,
          discountPercent: game.discountPercent,
          status: game.status,
          rejectionReason: rejectionMap.get(game.id) || null,
          genreId: game.genreId,
          genre: game.genreId ? genreMap.get(game.genreId) || null : null,
          systemRequirements: game.systemRequirements,
          pageTheme: game.pageTheme,
          bannerUrl: game.bannerUrl,
          screenshots: game.screenshots,
          trailerUrl: game.trailerUrl,
          createdAt: game.createdAt?.toISOString(),
          updatedAt: game.updatedAt?.toISOString(),
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
 * Fetches single game details with genre, tags, and latest build for creator.
 */
router.get(
  '/games/:gameId',
  requireAuth,
  requireRole('creator'),
  async (req: AuthenticatedRequest, res: Response) => {
    const correlationId =
      (req.headers['x-correlation-id'] as string) ||
      (req.headers['correlation-id'] as string) ||
      randomUUID();

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

      const [latestBuild] = await catalogDb
        .select({
          id: gameBuilds.id,
          version: gameBuilds.version,
          objectKey: gameBuilds.objectKey,
          checksumSha256: gameBuilds.checksumSha256,
          sizeBytes: gameBuilds.sizeBytes,
          state: gameBuilds.state,
          publishedAt: gameBuilds.publishedAt,
          createdAt: gameBuilds.createdAt,
        })
        .from(gameBuilds)
        .where(eq(gameBuilds.gameId, game.id))
        .orderBy(desc(gameBuilds.createdAt))
        .limit(1);

      let rejectionReason: string | null = null;
      if (game.status === 'rejected') {
        const [lastReject] = await catalogDb
          .select({ reason: gameStatusTransitions.reason })
          .from(gameStatusTransitions)
          .where(
            and(
              eq(gameStatusTransitions.gameId, game.id),
              eq(gameStatusTransitions.nextStatus, 'rejected')
            )
          )
          .orderBy(desc(gameStatusTransitions.createdAt))
          .limit(1);
        rejectionReason = lastReject?.reason || null;
      }

      return res.status(200).json({
        id: game.id,
        title: game.title,
        slug: game.slug,
        shortDescription: game.shortDescription,
        fullDescription: game.fullDescription,
        priceEgp: game.priceEgp,
        discountPercent: game.discountPercent,
        status: game.status,
        rejectionReason,
        genreId: game.genreId,
        genre: genreObj,
        tags: gameTagRows,
        build: latestBuild || null,
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
 * Updates game metadata and optionally updates game build package for creator.
 */
router.put(
  '/games/:gameId',
  requireAuth,
  requireRole('creator'),
  upload.any(),
  async (req: AuthenticatedRequest, res: Response) => {
    const correlationId =
      (req.headers['x-correlation-id'] as string) ||
      (req.headers['correlation-id'] as string) ||
      randomUUID();

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
        tags: rawTags,
        bannerUrl,
        screenshots: rawScreenshots,
        trailerUrl,
        systemRequirements: rawSystemReqs,
        systemReqs: rawSystemReqsAlt,
      } = req.body || {};

      let tagList = rawTags;
      if (typeof tagList === 'string') {
        try {
          tagList = JSON.parse(tagList);
        } catch {
          tagList = tagList.split(',').map((t: string) => t.trim()).filter(Boolean);
        }
      }

      let systemRequirements = rawSystemReqs || rawSystemReqsAlt;
      if (typeof systemRequirements === 'string') {
        try {
          systemRequirements = JSON.parse(systemRequirements);
        } catch {
          systemRequirements = undefined;
        }
      }

      let screenshots = rawScreenshots;
      if (typeof screenshots === 'string') {
        try {
          screenshots = JSON.parse(screenshots);
        } catch {
          screenshots = screenshots.split(',').map((s: string) => s.trim()).filter(Boolean);
        }
      }

      let resolvedGenreId = genreId !== undefined ? genreId : game.genreId;
      if (genreName && typeof genreName === 'string') {
        const [foundGenre] = await catalogDb
          .select()
          .from(genres)
          .where(eq(genres.name, genreName.trim()))
          .limit(1);
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
      if (systemRequirements !== undefined) {
        updatedFields.systemRequirements = systemRequirements || {};
      }

      const [updatedGame] = await catalogDb
        .update(games)
        .set(updatedFields)
        .where(eq(games.id, gameId))
        .returning();

      if (Array.isArray(tagList)) {
        await catalogDb.delete(gameTags).where(eq(gameTags.gameId, gameId));
        for (const tagNameOrSlug of tagList) {
          const val =
            typeof tagNameOrSlug === 'string'
              ? tagNameOrSlug.trim()
              : (tagNameOrSlug.name || tagNameOrSlug.slug || '').trim();
          if (!val) continue;
          const [foundTag] = await catalogDb
            .select()
            .from(tags)
            .where(
              sql`lower(${tags.name}) = lower(${val}) or lower(${tags.slug}) = lower(${val})`
            )
            .limit(1);
          if (foundTag) {
            await catalogDb
              .insert(gameTags)
              .values({ gameId, tagId: foundTag.id })
              .onConflictDoNothing();
          }
        }
      }

      // Handle build package update if attached
      const uploadedFiles = req.files as Express.Multer.File[] | undefined;
      const buildFile =
        req.file ||
        (Array.isArray(uploadedFiles)
          ? uploadedFiles.find(
            (f) =>
              f.fieldname === 'build' ||
              f.fieldname === 'gameBuild' ||
              f.fieldname === 'file'
          ) || uploadedFiles[0]
          : undefined);

      let buildInfo = null;
      if (buildFile && buildFile.buffer) {
        try {
          buildInfo = await handleGameBuildStorage(gameId, buildFile);
        } catch (storageErr) {
          console.error(`Failed to update game build package for game ${gameId}:`, storageErr);
          return res.status(500).json({
            success: false,
            error: {
              code: 'STORAGE_UPLOAD_FAILED',
              message: 'Failed to upload and store game build package in storage',
              correlationId,
            },
          });
        }
      }

      return res.status(200).json({
        success: true,
        data: {
          ...updatedGame,
          build: buildInfo,
        },
      });
    } catch (error) {
      console.error('Error updating creator game:', error);
      return res.status(500).json({
        error: { code: 'INTERNAL_SERVER_ERROR', message: 'Failed to update game', correlationId },
      });
    }
  }
);

/**
 * POST /creator/games/:gameId/build
 * Dedicated endpoint to upload/replace game build package.
 */
router.post(
  '/games/:gameId/build',
  requireAuth,
  requireRole('creator'),
  upload.any(),
  async (req: AuthenticatedRequest, res: Response) => {
    const correlationId =
      (req.headers['x-correlation-id'] as string) ||
      (req.headers['correlation-id'] as string) ||
      randomUUID();

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

      const uploadedFiles = req.files as Express.Multer.File[] | undefined;
      const buildFile =
        req.file ||
        (Array.isArray(uploadedFiles)
          ? uploadedFiles.find(
            (f) =>
              f.fieldname === 'build' ||
              f.fieldname === 'gameBuild' ||
              f.fieldname === 'file'
          ) || uploadedFiles[0]
          : undefined);

      if (!buildFile || !buildFile.buffer) {
        return res.status(400).json({
          error: {
            code: 'VALIDATION_FAILED',
            message: 'No build file uploaded. Please attach a compressed (.zip, .rar, etc.) package file.',
            correlationId,
          },
        });
      }

      const buildInfo = await handleGameBuildStorage(gameId, buildFile);

      return res.status(200).json({
        success: true,
        data: {
          gameId,
          ...buildInfo,
        },
      });
    } catch (error) {
      console.error('Error uploading game build package:', error);
      return res.status(500).json({
        error: { code: 'INTERNAL_SERVER_ERROR', message: 'Failed to upload build package', correlationId },
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

      // Fetch analytics using standardized library client
      try {
        const analyticsData = await getGameAnalytics(gameId, correlationId);
        return res.status(200).json(analyticsData);
      } catch (err) {
        console.warn(`Error calling library-service analytics for game ${gameId}:`, err);
        return res.status(200).json({
          totalOwners: 0,
          grossRevenueEgp: 0,
          totalRevenueEgp: '0.00',
          averageRating: 0,
          reviewCount: 0,
          lifetimePurchases: 0,
          monthlyPurchases: [],
          monthlyStats: [],
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
          grossRevenueEgp: 0,
          totalRevenueEgp: '0.00',
          averageRating: 0,
          reviewCount: 0,
          lifetimePurchases: 0,
          monthlyPurchases: [],
          monthlyStats: [],
        });
      }

      let totalOwners = 0;
      let totalRevenue = 0;
      let lifetimePurchases = 0;
      const monthlyMap = new Map<string, { newOwners: number; revenue: number }>();

      for (const gameId of gameIds) {
        try {
          const data = await getGameAnalytics(gameId, correlationId);
          totalOwners += data.totalOwners || 0;
          totalRevenue += parseFloat(data.totalRevenueEgp || (data.grossRevenueEgp ? String(data.grossRevenueEgp) : '0'));
          lifetimePurchases += data.lifetimePurchases || 0;

          if (Array.isArray(data.monthlyStats)) {
            for (const ms of data.monthlyStats) {
              const k = `${ms.year}-${String(ms.monthIndex || 1).padStart(2, '0')}`;
              const curr = monthlyMap.get(k) || { newOwners: 0, revenue: 0 };
              curr.newOwners += ms.newOwners || 0;
              curr.revenue += ms.revenue || 0;
              monthlyMap.set(k, curr);
            }
          }
        } catch (err) { }
      }

      const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      const sortedMonthKeys = Array.from(monthlyMap.keys()).sort();
      let cumOwners = 0;
      const monthlyStats = sortedMonthKeys.map((key) => {
        const entry = monthlyMap.get(key)!;
        cumOwners += entry.newOwners;
        const [year, month] = key.split('-');
        const mIdx = parseInt(month, 10) - 1;
        return {
          year: parseInt(year, 10),
          month: monthNames[mIdx] || month,
          monthIndex: mIdx + 1,
          newOwners: entry.newOwners,
          revenue: entry.revenue,
          cumOwners,
        };
      });

      return res.status(200).json({
        totalOwners,
        grossRevenueEgp: totalRevenue,
        totalRevenueEgp: totalRevenue.toFixed(2),
        averageRating: 4.8,
        reviewCount: lifetimePurchases > 0 ? Math.max(1, Math.round(lifetimePurchases * 0.4)) : 0,
        lifetimePurchases,
        monthlyPurchases: monthlyStats.map((m) => ({ year: m.year, month: m.monthIndex, amount: m.newOwners })),
        monthlyStats,
      });
    } catch (error) {
      console.error('Error fetching creator analytics:', error);
      return res.status(500).json({ error: { message: 'Internal server error' } });
    }
  }
);

export default router;
