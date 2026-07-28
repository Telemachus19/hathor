import cors from 'cors';
import express, { Request, Response, type Express } from 'express';
import { eq, and, inArray, count } from 'drizzle-orm';
import { catalogDb } from './infrastructure/db/client.js';
import { games, tags, gameTags } from './infrastructure/db/schema.js';

export type ReadinessCheck = () => Promise<void>;

export function createCatalogApp(checkDatabase: ReadinessCheck): Express {
  const app = express();
  const corsOrigin = process.env.CORS_ORIGIN || process.env.FRONTEND_URL || 'http://localhost:3000';
  app.use(
    cors({
      origin: (origin, callback) => {
        if (!origin || origin === corsOrigin || origin.startsWith('http://localhost:')) {
          callback(null, true);
        } else {
          callback(null, false);
        }
      },
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'X-Correlation-ID', 'Idempotency-Key'],
      exposedHeaders: ['X-Correlation-ID'],
    })
  );
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
        tagSlugs = rawTags.split(',').map((t) => t.trim().toLowerCase()).filter(Boolean);
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
        where: and(
          eq(games.status, 'published'),
          eq(games.slug, slug)
        ),
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

  return app;
}
