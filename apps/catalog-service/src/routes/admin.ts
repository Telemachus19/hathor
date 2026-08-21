import { Router, Response } from 'express';
import { eq, sql, desc, inArray } from 'drizzle-orm';
import { randomUUID } from 'node:crypto';
import { Readable } from 'node:stream';
import { GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { requireAuth, requireRole, AuthenticatedRequest } from '../middleware/auth.js';
import { catalogDb } from '../infrastructure/db/client.js';
import {
  games,
  gameStatusTransitions,
  genres,
  tags,
  gameTags,
  auditLogs,
  gameBuilds,
} from '../infrastructure/db/schema.js';
import { isValidTransition, VALID_GAME_STATUSES } from '../domain/stateMachine.js';
import { r2Client, R2_BUCKET_NAME } from '../infrastructure/storage/r2Client.js';

const router: Router = Router();

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// GET /admin/games
router.get('/games', requireAuth, requireRole('admin'), async (req: AuthenticatedRequest, res: Response) => {
  const limit = Math.min(parseInt(req.query.limit as string) || 25, 100);
  const cursor = parseInt(req.query.cursor as string) || 0;

  try {
    const fetchedGames = await catalogDb
      .select({
        id: games.id,
        creatorId: games.creatorId,
        title: games.title,
        slug: games.slug,
        shortDescription: games.shortDescription,
        fullDescription: games.fullDescription,
        priceEgp: games.priceEgp,
        discountPercent: games.discountPercent,
        bannerUrl: games.bannerUrl,
        screenshots: games.screenshots,
        trailerUrl: games.trailerUrl,
        systemRequirements: games.systemRequirements,
        pageTheme: games.pageTheme,
        status: games.status,
        genreId: games.genreId,
        genre: {
          id: genres.id,
          name: genres.name,
          slug: genres.slug,
        },
        createdAt: games.createdAt,
        updatedAt: games.updatedAt,
      })
      .from(games)
      .leftJoin(genres, eq(games.genreId, genres.id))
      .orderBy(desc(games.createdAt))
      .limit(limit + 1)
      .offset(cursor);

    let nextCursor: string | null = null;
    if (fetchedGames.length > limit) {
      nextCursor = (cursor + limit).toString();
      fetchedGames.pop();
    }

    const gameIds = fetchedGames.map((g) => g.id);
    const gameTagsMap: Record<string, { id: number; name: string; slug: string }[]> = {};
    if (gameIds.length > 0) {
      const tagRows = await catalogDb
        .select({
          gameId: gameTags.gameId,
          id: tags.id,
          name: tags.name,
          slug: tags.slug,
        })
        .from(gameTags)
        .innerJoin(tags, eq(gameTags.tagId, tags.id))
        .where(inArray(gameTags.gameId, gameIds));

      for (const row of tagRows) {
        if (!gameTagsMap[row.gameId]) {
          gameTagsMap[row.gameId] = [];
        }
        gameTagsMap[row.gameId].push({ id: row.id, name: row.name, slug: row.slug });
      }
    }

    const itemsWithTags = fetchedGames.map((g) => ({
      ...g,
      tags: gameTagsMap[g.id] || [],
    }));

    res.status(200).json({
      items: itemsWithTags,
      nextCursor,
    });
  } catch (error) {
    console.error('List games error:', error);
    res.status(500).json({ error: { code: 'INTERNAL_SERVER_ERROR', message: 'Failed to list games' } });
  }
});

// GET /admin/submissions
router.get('/submissions', requireAuth, requireRole('admin'), async (req: AuthenticatedRequest, res: Response) => {
  const limit = Math.min(parseInt(req.query.limit as string) || 50, 100);
  const cursor = parseInt(req.query.cursor as string) || 0;
  const statusFilter = req.query.status as string;

  try {
    const fetchedGames = await catalogDb
      .select({
        id: games.id,
        creatorId: games.creatorId,
        title: games.title,
        slug: games.slug,
        shortDescription: games.shortDescription,
        fullDescription: games.fullDescription,
        priceEgp: games.priceEgp,
        discountPercent: games.discountPercent,
        bannerUrl: games.bannerUrl,
        screenshots: games.screenshots,
        trailerUrl: games.trailerUrl,
        systemRequirements: games.systemRequirements,
        pageTheme: games.pageTheme,
        status: games.status,
        genreId: games.genreId,
        genre: {
          id: genres.id,
          name: genres.name,
          slug: genres.slug,
        },
        createdAt: games.createdAt,
        updatedAt: games.updatedAt,
      })
      .from(games)
      .leftJoin(genres, eq(games.genreId, genres.id))
      .where(inArray(games.status, ['pending_review']))
      .orderBy(desc(games.updatedAt))
      .limit(limit + 1)
      .offset(cursor);

    let nextCursor: string | null = null;
    if (fetchedGames.length > limit) {
      nextCursor = (cursor + limit).toString();
      fetchedGames.pop();
    }

    res.status(200).json({
      items: fetchedGames,
      nextCursor,
    });
  } catch (error) {
    console.error('List submissions error:', error);
    res.status(500).json({ error: { code: 'INTERNAL_SERVER_ERROR', message: 'Failed to list submissions' } });
  }
});

function formatPresignedUrlForClient(rawUrl: string): string {
  if (process.env.R2_PUBLIC_URL) {
    return rawUrl.replace(/^https?:\/\/[^/]+/, process.env.R2_PUBLIC_URL);
  }
  return rawUrl.replace('http://minio:9000', 'http://localhost:9000');
}

// GET /admin/games/:gameId
router.get('/games/:gameId', requireAuth, requireRole('admin'), async (req: AuthenticatedRequest, res: Response) => {
  const { gameId } = req.params;
  if (!gameId || !UUID_REGEX.test(gameId)) {
    return res.status(400).json({ error: { code: 'VALIDATION_FAILED', message: 'Invalid gameId format' } });
  }

  try {
    const [game] = await catalogDb
      .select({
        id: games.id,
        creatorId: games.creatorId,
        title: games.title,
        slug: games.slug,
        shortDescription: games.shortDescription,
        fullDescription: games.fullDescription,
        priceEgp: games.priceEgp,
        discountPercent: games.discountPercent,
        bannerUrl: games.bannerUrl,
        screenshots: games.screenshots,
        trailerUrl: games.trailerUrl,
        systemRequirements: games.systemRequirements,
        pageTheme: games.pageTheme,
        status: games.status,
        genreId: games.genreId,
        genre: {
          id: genres.id,
          name: genres.name,
          slug: genres.slug,
        },
        createdAt: games.createdAt,
        updatedAt: games.updatedAt,
      })
      .from(games)
      .leftJoin(genres, eq(games.genreId, genres.id))
      .where(eq(games.id, gameId))
      .limit(1);

    if (!game) {
      return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Game not found' } });
    }

    const gameTagRows = await catalogDb
      .select({ id: tags.id, name: tags.name, slug: tags.slug })
      .from(gameTags)
      .innerJoin(tags, eq(gameTags.tagId, tags.id))
      .where(eq(gameTags.gameId, game.id));

    // Fetch latest build package if uploaded
    const [latestBuild] = await catalogDb
      .select()
      .from(gameBuilds)
      .where(eq(gameBuilds.gameId, game.id))
      .orderBy(desc(gameBuilds.createdAt))
      .limit(1);

    let downloadUrl: string | null = null;
    if (latestBuild) {
      try {
        const command = new GetObjectCommand({
          Bucket: R2_BUCKET_NAME,
          Key: latestBuild.objectKey,
        });
        const rawSignedUrl = await getSignedUrl(r2Client, command, { expiresIn: 3600 });
        downloadUrl = formatPresignedUrlForClient(rawSignedUrl);
      } catch (e) {
        console.warn('Failed to generate presigned download URL for build:', e);
      }
    }

    res.status(200).json({
      ...game,
      tags: gameTagRows,
      build: latestBuild
        ? {
            id: latestBuild.id,
            version: latestBuild.version,
            objectKey: latestBuild.objectKey,
            sizeBytes: latestBuild.sizeBytes,
            checksumSha256: latestBuild.checksumSha256,
            state: latestBuild.state,
            createdAt: latestBuild.createdAt,
            publishedAt: latestBuild.publishedAt,
            downloadUrl,
          }
        : null,
    });
  } catch (error) {
    console.error('Get admin game error:', error);
    res.status(500).json({ error: { code: 'INTERNAL_SERVER_ERROR', message: 'Failed to get game' } });
  }
});

// GET /admin/games/:gameId/build/download - Generate fresh download URL for admin testing
router.get(
  '/games/:gameId/build/download',
  requireAuth,
  requireRole('admin'),
  async (req: AuthenticatedRequest, res: Response) => {
    const { gameId } = req.params;
    if (!gameId || !UUID_REGEX.test(gameId)) {
      return res.status(400).json({ error: { code: 'VALIDATION_FAILED', message: 'Invalid gameId format' } });
    }

    try {
      const [latestBuild] = await catalogDb
        .select()
        .from(gameBuilds)
        .where(eq(gameBuilds.gameId, gameId))
        .orderBy(desc(gameBuilds.createdAt))
        .limit(1);

      if (!latestBuild) {
        return res
          .status(404)
          .json({ error: { code: 'NOT_FOUND', message: 'No build package found for this game' } });
      }

      const command = new GetObjectCommand({
        Bucket: R2_BUCKET_NAME,
        Key: latestBuild.objectKey,
      });

      const rawUrl = await getSignedUrl(r2Client, command, { expiresIn: 3600 });
      const url = formatPresignedUrlForClient(rawUrl);

      return res.status(200).json({
        url,
        objectKey: latestBuild.objectKey,
        version: latestBuild.version,
        sizeBytes: latestBuild.sizeBytes,
        checksumSha256: latestBuild.checksumSha256,
        expiresIn: 3600,
      });
    } catch (err: any) {
      console.error('Failed to generate admin download URL:', err);
      return res.status(500).json({
        error: {
          code: 'INTERNAL_SERVER_ERROR',
          message: err.message || 'Failed to authorize build download',
        },
      });
    }
  }
);

// GET /admin/games/:gameId/build/file - Stream file directly for robust admin download
router.get(
  '/games/:gameId/build/file',
  requireAuth,
  requireRole('admin'),
  async (req: AuthenticatedRequest, res: Response) => {
    const { gameId } = req.params;
    if (!gameId || !UUID_REGEX.test(gameId)) {
      return res.status(400).json({ error: { code: 'VALIDATION_FAILED', message: 'Invalid gameId format' } });
    }

    try {
      const [game] = await catalogDb
        .select({ id: games.id, title: games.title, slug: games.slug })
        .from(games)
        .where(eq(games.id, gameId))
        .limit(1);

      const [latestBuild] = await catalogDb
        .select()
        .from(gameBuilds)
        .where(eq(gameBuilds.gameId, gameId))
        .orderBy(desc(gameBuilds.createdAt))
        .limit(1);

      if (!latestBuild) {
        return res
          .status(404)
          .json({ error: { code: 'NOT_FOUND', message: 'No build package found for this game' } });
      }

      const command = new GetObjectCommand({
        Bucket: R2_BUCKET_NAME,
        Key: latestBuild.objectKey,
      });

      const s3Response = await r2Client.send(command);

      const fileName = `${game?.slug || 'game'}-${latestBuild.version || 'v1.0.0'}.zip`;
      res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
      res.setHeader('Content-Type', s3Response.ContentType || 'application/zip');
      if (s3Response.ContentLength) {
        res.setHeader('Content-Length', s3Response.ContentLength);
      }

      if (s3Response.Body instanceof Readable) {
        s3Response.Body.pipe(res);
      } else if (s3Response.Body) {
        const stream = s3Response.Body as any;
        if (typeof stream.pipe === 'function') {
          stream.pipe(res);
        } else {
          const bytes = await s3Response.Body.transformToByteArray();
          res.end(Buffer.from(bytes));
        }
      } else {
        res.status(500).send('Empty file body');
      }
    } catch (err: any) {
      console.error('Failed to stream admin build download:', err);
      return res.status(500).json({
        error: {
          code: 'INTERNAL_SERVER_ERROR',
          message: err.message || 'Failed to download build package',
        },
      });
    }
  }
);

// GET /admin/audit-logs
router.get('/audit-logs', requireAuth, requireRole('admin'), async (req: AuthenticatedRequest, res: Response) => {
  const limit = Math.min(parseInt(req.query.limit as string) || 100, 500);
  const cursor = parseInt(req.query.cursor as string) || 0;

  try {
    const fetchedLogs = await catalogDb
      .select()
      .from(auditLogs)
      .orderBy(desc(auditLogs.createdAt))
      .limit(limit + 1)
      .offset(cursor);

    let nextCursor: string | null = null;
    if (fetchedLogs.length > limit) {
      nextCursor = (cursor + limit).toString();
      fetchedLogs.pop();
    }

    res.status(200).json({
      items: fetchedLogs,
      nextCursor,
    });
  } catch (error) {
    console.error('List audit logs error:', error);
    res.status(500).json({ error: { code: 'INTERNAL_SERVER_ERROR', message: 'Failed to list audit logs' } });
  }
});

// PATCH /admin/games/:gameId/taxonomy
router.patch('/games/:gameId/taxonomy', requireAuth, requireRole('admin'), async (req: AuthenticatedRequest, res: Response) => {
  const correlationId = (req.headers['x-correlation-id'] as string) || randomUUID();
  const { gameId } = req.params;
  const { genreId, tags: tagList } = req.body || {};

  try {
    await catalogDb.transaction(async (tx) => {
      if (genreId !== undefined) {
        await tx.update(games).set({ genreId, updatedAt: new Date() }).where(eq(games.id, gameId));
      }

      if (Array.isArray(tagList)) {
        await tx.delete(gameTags).where(eq(gameTags.gameId, gameId));
        for (const tagNameOrSlug of tagList) {
          const val =
            typeof tagNameOrSlug === 'string'
              ? tagNameOrSlug.trim()
              : (tagNameOrSlug?.name || tagNameOrSlug?.slug || '').trim();
          if (!val) continue;

          let [foundTag] = await tx
            .select()
            .from(tags)
            .where(
              sql`lower(${tags.name}) = lower(${val}) or lower(${tags.slug}) = lower(${val})`
            )
            .limit(1);

          if (!foundTag) {
            const finalSlug = val
              .toLowerCase()
              .replace(/[^a-z0-9]+/g, '-')
              .replace(/(^-|-$)/g, '');
            const [newTag] = await tx
              .insert(tags)
              .values({ name: val, slug: finalSlug })
              .onConflictDoNothing()
              .returning();
            foundTag = newTag;
          }

          if (foundTag) {
            await tx
              .insert(gameTags)
              .values({ gameId, tagId: foundTag.id })
              .onConflictDoNothing();
          }
        }
      }

      await tx.insert(auditLogs).values({
        actorId: req.user!.id,
        targetType: 'game',
        targetId: gameId,
        action: 'update_taxonomy',
        details: { genreId, tags: tagList },
      });
    });
    
    return res.status(204).send();
  } catch (error) {
    console.error('Error in admin taxonomy update:', error);
    return res.status(500).json({ error: { code: 'INTERNAL_SERVER_ERROR', message: 'Failed to update taxonomy', correlationId } });
  }
});

// PATCH /admin/games/:gameId/status — Admin status mutation endpoint
router.patch(
  '/games/:gameId/status',
  requireAuth,
  requireRole('admin'),
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

        const priorStatus = existingGame.status || 'draft';

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

        await tx.insert(auditLogs).values({
          actorId: req.user!.id,
          targetType: 'game',
          targetId: gameId,
          action: `game_status_${status}`,
          details: { priorStatus, nextStatus: status, reason: reason || null },
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
      console.error('Error in admin game status transition:', error);
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

// GET /admin/genres
router.get('/genres', requireAuth, requireRole('admin'), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const items = await catalogDb.select().from(genres).orderBy(genres.name);
    res.json({ items });
  } catch (error) {
    res.status(500).json({ error: { code: 'INTERNAL_SERVER_ERROR', message: 'Failed to list genres', correlationId: randomUUID() } });
  }
});

// POST /admin/genres
router.post('/genres', requireAuth, requireRole('admin'), async (req: AuthenticatedRequest, res: Response) => {
  const { name, slug } = req.body || {};
  if (!name) return res.status(400).json({ error: { code: 'VALIDATION_FAILED', message: 'name required', correlationId: randomUUID() } });
  
  const finalSlug = (slug || name)
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');

  try {
    const [genre] = await catalogDb.insert(genres).values({ name, slug: finalSlug }).returning();
    await catalogDb.insert(auditLogs).values({ actorId: req.user!.id, targetType: 'genre', targetId: genre.id.toString(), action: 'create_genre', details: { name, slug: finalSlug } });
    res.status(201).json(genre);
  } catch (error) {
    res.status(500).json({ error: { code: 'INTERNAL_SERVER_ERROR', message: 'Failed to create genre', correlationId: randomUUID() } });
  }
});

// PUT /admin/genres/:genreId
router.put('/genres/:genreId', requireAuth, requireRole('admin'), async (req: AuthenticatedRequest, res: Response) => {
  const { name, slug } = req.body || {};
  const finalSlug = slug || (name ? name.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') : undefined);
  try {
    const [genre] = await catalogDb.update(genres).set({ name, ...(finalSlug ? { slug: finalSlug } : {}) }).where(eq(genres.id, Number(req.params.genreId))).returning();
    if (!genre) return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Genre not found', correlationId: randomUUID() } });
    await catalogDb.insert(auditLogs).values({ actorId: req.user!.id, targetType: 'genre', targetId: genre.id.toString(), action: 'update_genre', details: { name, slug: finalSlug } });
    res.json(genre);
  } catch (error) {
    res.status(500).json({ error: { code: 'INTERNAL_SERVER_ERROR', message: 'Failed to update genre', correlationId: randomUUID() } });
  }
});

// DELETE /admin/genres/:genreId
router.delete('/genres/:genreId', requireAuth, requireRole('admin'), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const [genre] = await catalogDb.delete(genres).where(eq(genres.id, Number(req.params.genreId))).returning();
    if (!genre) return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Genre not found', correlationId: randomUUID() } });
    await catalogDb.insert(auditLogs).values({ actorId: req.user!.id, targetType: 'genre', targetId: genre.id.toString(), action: 'delete_genre', details: { name: genre.name } });
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: { code: 'INTERNAL_SERVER_ERROR', message: 'Failed to delete genre', correlationId: randomUUID() } });
  }
});

// GET /admin/tags
router.get('/tags', requireAuth, requireRole('admin'), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const items = await catalogDb.select().from(tags).orderBy(tags.name);
    res.json({ items });
  } catch (error) {
    res.status(500).json({ error: { code: 'INTERNAL_SERVER_ERROR', message: 'Failed to list tags', correlationId: randomUUID() } });
  }
});

// POST /admin/tags
router.post('/tags', requireAuth, requireRole('admin'), async (req: AuthenticatedRequest, res: Response) => {
  const { name, slug } = req.body || {};
  if (!name) return res.status(400).json({ error: { code: 'VALIDATION_FAILED', message: 'name required', correlationId: randomUUID() } });
  
  const finalSlug = (slug || name)
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');

  try {
    const [tag] = await catalogDb.insert(tags).values({ name, slug: finalSlug }).returning();
    await catalogDb.insert(auditLogs).values({ actorId: req.user!.id, targetType: 'tag', targetId: tag.id.toString(), action: 'create_tag', details: { name, slug: finalSlug } });
    res.status(201).json(tag);
  } catch (error) {
    res.status(500).json({ error: { code: 'INTERNAL_SERVER_ERROR', message: 'Failed to create tag', correlationId: randomUUID() } });
  }
});

// PUT /admin/tags/:tagId
router.put('/tags/:tagId', requireAuth, requireRole('admin'), async (req: AuthenticatedRequest, res: Response) => {
  const { name, slug } = req.body || {};
  const finalSlug = slug || (name ? name.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') : undefined);
  try {
    const [tag] = await catalogDb.update(tags).set({ name, ...(finalSlug ? { slug: finalSlug } : {}) }).where(eq(tags.id, Number(req.params.tagId))).returning();
    if (!tag) return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Tag not found', correlationId: randomUUID() } });
    await catalogDb.insert(auditLogs).values({ actorId: req.user!.id, targetType: 'tag', targetId: tag.id.toString(), action: 'update_tag', details: { name, slug: finalSlug } });
    res.json(tag);
  } catch (error) {
    res.status(500).json({ error: { code: 'INTERNAL_SERVER_ERROR', message: 'Failed to update tag', correlationId: randomUUID() } });
  }
});

// DELETE /admin/tags/:tagId
router.delete('/tags/:tagId', requireAuth, requireRole('admin'), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const [tag] = await catalogDb.delete(tags).where(eq(tags.id, Number(req.params.tagId))).returning();
    if (!tag) return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Tag not found', correlationId: randomUUID() } });
    await catalogDb.insert(auditLogs).values({ actorId: req.user!.id, targetType: 'tag', targetId: tag.id.toString(), action: 'delete_tag', details: { name: tag.name } });
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: { code: 'INTERNAL_SERVER_ERROR', message: 'Failed to delete tag', correlationId: randomUUID() } });
  }
});

export default router;
