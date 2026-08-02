import cors from 'cors';
import express, { Request, Response, type Express } from 'express';
import jwt from 'jsonwebtoken';
import { eq, and, inArray, count } from 'drizzle-orm';
import { catalogDb } from './infrastructure/db/client.js';
import { games, tags, gameTags } from './infrastructure/db/schema.js';

export type ReadinessCheck = () => Promise<void>;

export function createCatalogApp(checkDatabase: ReadinessCheck): Express {
  const app = express();

  app.use(cors());
  app.use(express.json());

  app.get('/health/live', (_req: Request, res: Response) => {
    res.status(200).json({
      success: true,
      data: {
        service: 'catalog-service',
        status: 'live',
        timestamp: new Date().toISOString(),
      },
    });
  });

  app.get('/health/ready', async (_req: Request, res: Response) => {
    try {
      await checkDatabase();
      res.status(200).json({
        success: true,
        data: {
          service: 'catalog-service',
          status: 'ready',
          timestamp: new Date().toISOString(),
          checks: { database: 'up' },
        },
      });
    } catch {
      res.status(503).json({
        success: false,
        error: { code: 'SERVICE_NOT_READY', message: 'Catalog service is not ready' },
      });
    }
  });

  app.get('/store/games', async (req: Request, res: Response) => {
    try {
      const page = Math.max(1, parseInt(req.query.page as string) || 1);
      const limit = Math.min(50, Math.max(1, parseInt(req.query.limit as string) || 10));
      const skip = (page - 1) * limit;

      const rawTags = req.query.tags || req.query.tag;
      let tagSlugs: string[] = [];
      if (typeof rawTags === 'string') {
        tagSlugs = rawTags
          .split(',')
          .map((t) => t.trim().toLowerCase())
          .filter(Boolean);
      } else if (Array.isArray(rawTags)) {
        tagSlugs = rawTags.map((t) => String(t).trim().toLowerCase()).filter(Boolean);
      }

      const whereConditions = [eq(games.status, 'published')];

      if (tagSlugs.length > 0) {
        const matchingGameIdRecords = await catalogDb
          .selectDistinct({ gameId: gameTags.gameId })
          .from(gameTags)
          .innerJoin(tags, eq(gameTags.tagId, tags.id))
          .where(inArray(tags.slug, tagSlugs));

        const matchingIds = matchingGameIdRecords.map((r) => r.gameId);

        if (matchingIds.length === 0) {
          return res.status(200).json({
            success: true,
            data: {
              items: [],
              pagination: { page, limit, totalItems: 0, totalPages: 0 },
            },
          });
        }

        whereConditions.push(inArray(games.id, matchingIds));
      }

      const gameRecords = await catalogDb
        .select({
          id: games.id,
          slug: games.slug,
          title: games.title,
          shortDescription: games.shortDescription,
          priceEgp: games.priceEgp,
          discountPercent: games.discountPercent,
          bannerUrl: games.bannerUrl,
          pageTheme: games.pageTheme,
          status: games.status,
          createdAt: games.createdAt,
        })
        .from(games)
        .where(and(...whereConditions))
        .limit(limit)
        .offset(skip);

      const gameIds = gameRecords.map((g) => g.id);
      const tagsByGameId: Record<string | number, Array<{ name: string; slug: string }>> = {};

      if (gameIds.length > 0) {
        const allGameTags = await catalogDb
          .select({
            gameId: gameTags.gameId,
            name: tags.name,
            slug: tags.slug,
          })
          .from(gameTags)
          .innerJoin(tags, eq(gameTags.tagId, tags.id))
          .where(inArray(gameTags.gameId, gameIds));

        for (const gt of allGameTags) {
          if (!tagsByGameId[gt.gameId]) {
            tagsByGameId[gt.gameId] = [];
          }
          tagsByGameId[gt.gameId].push({ name: gt.name, slug: gt.slug });
        }
      }

      const itemsWithTags = gameRecords.map(({ id, ...g }) => ({
        ...g,
        tags: tagsByGameId[id] || [],
      }));

      const [totalResult] = await catalogDb
        .select({ total: count(games.id) })
        .from(games)
        .where(and(...whereConditions));

      const totalItems = totalResult?.total || 0;
      const totalPages = Math.ceil(totalItems / limit);

      res.status(200).json({
        success: true,
        data: {
          items: itemsWithTags,
          pagination: {
            page,
            limit,
            totalItems,
            totalPages,
          },
        },
      });
    } catch (error) {
      console.error('Error fetching games catalog:', error);
      res.status(500).json({
        success: false,
        error: { code: 'INTERNAL_SERVER_ERROR', message: 'Failed to fetch catalog' },
      });
    }
  });

  app.get('/store/games/:slug', async (req: Request, res: Response) => {
    try {
      const { slug } = req.params;

      const game = await catalogDb.query.games.findFirst({
        where: and(eq(games.status, 'published'), eq(games.slug, slug)),
      });

      if (!game) {
        return res.status(404).json({
          success: false,
          error: { code: 'GAME_NOT_FOUND', message: 'Game not found or unavailable' },
        });
      }

      const gameTagRecords = await catalogDb
        .select({ name: tags.name, slug: tags.slug })
        .from(gameTags)
        .innerJoin(tags, eq(gameTags.tagId, tags.id))
        .where(eq(gameTags.gameId, game.id));

      const { id, creatorId, ...publicGameDetail } = game;

      res.status(200).json({
        success: true,
        data: {
          ...publicGameDetail,
          tags: gameTagRecords,
        },
      });
    } catch (error) {
      console.error('Error fetching game detail:', error);
      res.status(500).json({
        success: false,
        error: { code: 'INTERNAL_SERVER_ERROR', message: 'Failed to fetch game details' },
      });
    }
  });

  /**
   * PUT /creator/games/:gameId/theme
   * Creator Authorization & Ownership Verification (creator_id == caller_id).
   * Rejects unauthorized access attempts with HTTP 403 Forbidden to prevent cross-creator IDOR.
   */
  app.put('/creator/games/:gameId/theme', async (req: Request, res: Response) => {
    const correlationId =
      (req.headers['x-correlation-id'] as string) ||
      (req.headers['correlation-id'] as string) ||
      '';

    try {
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({
          success: false,
          error: {
            code: 'UNAUTHENTICATED',
            message: 'Missing or invalid Authorization header',
            correlationId,
          },
        });
      }

      const token = authHeader.split(' ')[1];
      let decoded: any;
      try {
        decoded = jwt.decode(token);
      } catch {
        return res.status(401).json({
          success: false,
          error: {
            code: 'UNAUTHENTICATED',
            message: 'Invalid authorization token',
            correlationId,
          },
        });
      }

      const callerId = decoded?.sub || decoded?.id;
      if (!callerId) {
        return res.status(401).json({
          success: false,
          error: {
            code: 'UNAUTHENTICATED',
            message: 'Caller identity could not be verified from token',
            correlationId,
          },
        });
      }

      const { gameId } = req.params;
      const [game] = await catalogDb
        .select()
        .from(games)
        .where(eq(games.id, gameId))
        .limit(1);

      if (!game) {
        return res.status(404).json({
          success: false,
          error: {
            code: 'GAME_NOT_FOUND',
            message: 'Game not found',
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
      await catalogDb
        .update(games)
        .set({
          pageTheme: themePayload,
          updatedAt: new Date(),
        })
        .where(eq(games.id, gameId));

      return res.status(200).json({
        success: true,
        data: {
          gameId: game.id,
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
  });

  /**
   * Helper to generate a URL-friendly slug from title.
   */
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
   * POST /creator/games
   * Creates a draft game associated with the authenticated creator (creator_id == caller_id).
   * Enforces pageTheme = {} and status = "draft".
   */
  app.post('/creator/games', async (req: Request, res: Response) => {
    const correlationId =
      (req.headers['x-correlation-id'] as string) ||
      (req.headers['correlation-id'] as string) ||
      '';

    try {
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({
          success: false,
          error: {
            code: 'UNAUTHENTICATED',
            message: 'Missing or invalid Authorization header',
            correlationId,
          },
        });
      }

      const token = authHeader.split(' ')[1];
      let decoded: any;
      try {
        decoded = jwt.decode(token);
      } catch {
        return res.status(401).json({
          success: false,
          error: {
            code: 'UNAUTHENTICATED',
            message: 'Invalid authorization token',
            correlationId,
          },
        });
      }

      const callerId = decoded?.sub || decoded?.id;
      if (!callerId) {
        return res.status(401).json({
          success: false,
          error: {
            code: 'UNAUTHENTICATED',
            message: 'Caller identity could not be verified from token',
            correlationId,
          },
        });
      }

      const {
        title,
        shortDescription,
        shortDesc,
        fullDescription,
        priceEgp,
        discountPercent,
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

      const baseSlug = customSlug && typeof customSlug === 'string' && customSlug.trim()
        ? slugifyTitle(customSlug)
        : slugifyTitle(title);

      const uniqueSuffix = Date.now().toString(36).slice(-4);
      const slug = `${baseSlug}-${uniqueSuffix}`;

      const [newGame] = await catalogDb
        .insert(games)
        .values({
          creatorId: callerId,
          title: title.trim(),
          slug,
          shortDescription: (shortDescription || shortDesc || title).trim(),
          fullDescription: (fullDescription || shortDescription || shortDesc || title).trim(),
          priceEgp: String(priceEgp !== undefined ? priceEgp : '0.00'),
          discountPercent: Number(discountPercent || 0),
          bannerUrl: bannerUrl || null,
          screenshots: Array.isArray(screenshots) ? screenshots : [],
          trailerUrl: trailerUrl || null,
          systemRequirements: systemRequirements || systemReqs || {},
          pageTheme: {}, // Mandatory empty JSON as per requirement
          status: 'draft', // Mandatory draft status as per requirement
        })
        .returning();

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
  });

  return app;
}
