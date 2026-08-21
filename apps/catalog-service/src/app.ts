import cors from 'cors';
import express, { Request, Response, type Express } from 'express';
import { eq, and, or, inArray, count } from 'drizzle-orm';
import { catalogDb } from './infrastructure/db/client.js';
import { games, tags, gameTags, genres } from './infrastructure/db/schema.js';
import adminRouter from './routes/admin.js';
import creatorRouter from './routes/creator.js';
import internalRouter from './routes/internal.js';
import { formatPriceEgp } from './utils/pricing.js';

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
      exposedHeaders: ['X-Correlation-ID'],
    })
  );
  app.use(express.json());

  app.use('/admin', adminRouter);
  app.use('/creator', creatorRouter);
  app.use('/internal/v1/catalog', internalRouter);

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

      const itemsWithTags = gameRecords.map(({ id, priceEgp, ...g }) => ({
        id,
        ...g,
        priceEgp: formatPriceEgp(priceEgp),
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
      const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(slug);
      const condition = isUuid
        ? eq(games.id, slug)
        : and(eq(games.status, 'published'), eq(games.slug, slug));

      const [game] = await catalogDb
        .select({
          id: games.id,
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
        .where(condition)
        .limit(1);

      if (!game) {
        return res.status(404).json({
          success: false,
          error: { code: 'GAME_NOT_FOUND', message: 'Game not found or unavailable' },
        });
      }

      const gameTagRecords = await catalogDb
        .select({ id: tags.id, name: tags.name, slug: tags.slug })
        .from(gameTags)
        .innerJoin(tags, eq(gameTags.tagId, tags.id))
        .where(eq(gameTags.gameId, game.id));

      const { priceEgp, ...publicGameDetail } = game;

      res.status(200).json({
        success: true,
        data: {
          ...publicGameDetail,
          priceEgp: formatPriceEgp(priceEgp),
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
