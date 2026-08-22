import cors from 'cors';
import express, { Request, Response, type Express } from 'express';
import { eq, and, or, inArray, count, desc, ilike, sql } from 'drizzle-orm';
import { catalogDb } from './infrastructure/db/client.js';
import { games, tags, gameTags, genres, reviews, gameReviews } from './infrastructure/db/schema.js';
import { requireAuth, requireRole, type AuthenticatedRequest } from './middleware/auth.js';
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

      // 1. Keyword search (case-insensitive substring match on games.title)
      const q = req.query.q as string | undefined;
      if (q && q.trim()) {
        whereConditions.push(ilike(games.title, `%${q.trim()}%`));
      }

      // 2. Multi-genre filter (by comma-separated slugs, IDs, or array)
      const rawGenre = (req.query.genre || req.query.genres) as string | string[] | undefined;
      const genreSlugsOrIds: string[] = [];
      if (rawGenre) {
        if (Array.isArray(rawGenre)) {
          for (const g of rawGenre) {
            genreSlugsOrIds.push(
              ...g.split(',').map((s) => s.trim().toLowerCase()).filter((s) => Boolean(s) && s !== 'all')
            );
          }
        } else if (typeof rawGenre === 'string') {
          genreSlugsOrIds.push(
            ...rawGenre.split(',').map((s) => s.trim().toLowerCase()).filter((s) => Boolean(s) && s !== 'all')
          );
        }
      }

      if (genreSlugsOrIds.length > 0) {
        const numericIds = genreSlugsOrIds.filter((s) => /^\d+$/.test(s)).map((s) => parseInt(s, 10));
        const stringSlugs = genreSlugsOrIds.filter((s) => !/^\d+$/.test(s));

        const foundGenreIds: number[] = [...numericIds];
        if (stringSlugs.length > 0) {
          const matchingGenres = await catalogDb
            .select({ id: genres.id })
            .from(genres)
            .where(inArray(genres.slug, stringSlugs));
          foundGenreIds.push(...matchingGenres.map((g) => g.id));
        }

        if (foundGenreIds.length === 0) {
          return res.status(200).json({
            success: true,
            data: {
              items: [],
              pagination: { page, limit, totalItems: 0, totalPages: 0 },
            },
          });
        }

        whereConditions.push(inArray(games.genreId, foundGenreIds));
      }

      // 3. Tags filter (matching game tags)
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

      // 4. Dynamic Order By based on sort selection
      const sort = (req.query.sort as string | undefined)?.toLowerCase();
      let orderByClause = desc(games.createdAt);
      if (sort === 'trending') {
        orderByClause = desc(games.updatedAt);
      } else if (sort === 'top_rated') {
        orderByClause = desc(games.discountPercent);
      } else if (sort === 'new_arrivals') {
        orderByClause = desc(games.createdAt);
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
          genreId: games.genreId,
          genreName: genres.name,
          genreSlug: genres.slug,
          createdAt: games.createdAt,
        })
        .from(games)
        .leftJoin(genres, eq(games.genreId, genres.id))
        .where(and(...whereConditions))
        .orderBy(orderByClause)
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

      const itemsWithTags = gameRecords.map(({ id, priceEgp, genreName, genreSlug, genreId, ...g }) => ({
        id,
        ...g,
        genreId,
        genre: genreName ? { id: genreId, name: genreName, slug: genreSlug } : null,
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

  // GET /store/genres - List all public genres
  app.get('/store/genres', async (_req: Request, res: Response) => {
    try {
      let items = await catalogDb.select().from(genres).orderBy(genres.name);
      if (!items || items.length === 0) {
        const defaultGenres = [
          { name: 'Action', slug: 'action' },
          { name: 'Adventure', slug: 'adventure' },
          { name: 'RPG', slug: 'rpg' },
          { name: 'Strategy', slug: 'strategy' },
          { name: 'Simulation', slug: 'simulation' },
          { name: 'Racing', slug: 'racing' },
          { name: 'Puzzle', slug: 'puzzle' },
          { name: 'Sports', slug: 'sports' },
          { name: 'Horror', slug: 'horror' },
          { name: 'Indie', slug: 'indie' },
          { name: 'Sci-Fi', slug: 'sci-fi' },
        ];
        for (const g of defaultGenres) {
          await catalogDb.insert(genres).values(g).onConflictDoNothing();
        }
        items = await catalogDb.select().from(genres).orderBy(genres.name);
      }
      res.status(200).json({ success: true, data: items });
    } catch (error) {
      console.error('Error fetching store genres:', error);
      res.status(500).json({
        success: false,
        error: { code: 'INTERNAL_SERVER_ERROR', message: 'Failed to fetch genres' },
      });
    }
  });

  // GET /store/tags - List all public tags
  app.get('/store/tags', async (_req: Request, res: Response) => {
    try {
      let items = await catalogDb.select().from(tags).orderBy(tags.name);
      if (!items || items.length === 0) {
        const defaultTags = [
          { name: 'Indie', slug: 'indie' },
          { name: 'Cyberpunk', slug: 'cyberpunk' },
          { name: 'Open World', slug: 'open-world' },
          { name: 'Singleplayer', slug: 'singleplayer' },
          { name: 'Multiplayer', slug: 'multiplayer' },
          { name: 'Turn-Based', slug: 'turn-based' },
          { name: 'Dark Fantasy', slug: 'dark-fantasy' },
          { name: 'Sci-Fi', slug: 'sci-fi' },
          { name: 'Historical', slug: 'historical' },
          { name: 'Pixel Art', slug: 'pixel-art' },
          { name: 'Sandbox', slug: 'sandbox' },
          { name: 'Crafting', slug: 'crafting' },
          { name: 'Roguelike', slug: 'roguelike' },
          { name: 'Stealth', slug: 'stealth' },
          { name: 'Platformer', slug: 'platformer' },
        ];
        for (const t of defaultTags) {
          await catalogDb.insert(tags).values(t).onConflictDoNothing();
        }
        items = await catalogDb.select().from(tags).orderBy(tags.name);
      }
      res.status(200).json({ success: true, data: items });
    } catch (error) {
      console.error('Error fetching store tags:', error);
      res.status(500).json({
        success: false,
        error: { code: 'INTERNAL_SERVER_ERROR', message: 'Failed to fetch tags' },
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

  // Helper to resolve game by ID or slug
  async function resolveGame(slugOrId: string) {
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(slugOrId);
    const condition = isUuid ? eq(games.id, slugOrId) : eq(games.slug, slugOrId);
    const [game] = await catalogDb
      .select({ id: games.id, title: games.title, slug: games.slug, status: games.status })
      .from(games)
      .where(condition)
      .limit(1);
    return game || null;
  }

  // GET /store/games/:slug/reviews - Public review list & calculated breakdown
  app.get('/store/games/:slug/reviews', async (req: Request, res: Response) => {
    try {
      const { slug } = req.params;
      const game = await resolveGame(slug);
      if (!game) {
        return res.status(404).json({
          success: false,
          error: { code: 'GAME_NOT_FOUND', message: 'Game not found' },
        });
      }

      const reviewRows = await catalogDb
        .select({
          id: reviews.id,
          userId: reviews.userId,
          userName: reviews.userName,
          sentiment: reviews.sentiment,
          content: reviews.content,
          createdAt: reviews.createdAt,
          updatedAt: reviews.updatedAt,
        })
        .from(reviews)
        .innerJoin(gameReviews, eq(reviews.id, gameReviews.reviewId))
        .where(eq(gameReviews.gameId, game.id))
        .orderBy(desc(reviews.createdAt));

      const totalReviews = reviewRows.length;
      const positiveCount = reviewRows.filter((r) => r.sentiment === 'positive').length;
      const mixedCount = reviewRows.filter((r) => r.sentiment === 'mixed').length;
      const negativeCount = reviewRows.filter((r) => r.sentiment === 'negative').length;

      const breakdown = [
        {
          sentiment: 'positive' as const,
          label: 'Positive',
          count: positiveCount,
          percent: totalReviews > 0 ? Math.round((positiveCount / totalReviews) * 100) : 0,
        },
        {
          sentiment: 'mixed' as const,
          label: 'Mixed',
          count: mixedCount,
          percent: totalReviews > 0 ? Math.round((mixedCount / totalReviews) * 100) : 0,
        },
        {
          sentiment: 'negative' as const,
          label: 'Negative',
          count: negativeCount,
          percent: totalReviews > 0 ? Math.round((negativeCount / totalReviews) * 100) : 0,
        },
      ];

      const weightedScore =
        totalReviews > 0
          ? (positiveCount * 1 + mixedCount * 0.5 + negativeCount * 0) / totalReviews
          : 0;
      const ratingPercentage = totalReviews > 0 ? Math.round(weightedScore * 100) : null;

      res.status(200).json({
        success: true,
        data: {
          reviews: reviewRows,
          totalReviews,
          breakdown,
          ratingPercentage,
        },
      });
    } catch (error) {
      console.error('Error fetching game reviews:', error);
      res.status(500).json({
        success: false,
        error: { code: 'INTERNAL_SERVER_ERROR', message: 'Failed to fetch reviews' },
      });
    }
  });

  // GET /store/games/:slug/reviews/mine - Fetch current user's review for this game
  app.get(
    '/store/games/:slug/reviews/mine',
    requireAuth,
    requireRole('gamer'),
    async (req: Request, res: Response) => {
      try {
        const { slug } = req.params;
        const authReq = req as AuthenticatedRequest;
        if (!authReq.user) {
          return res.status(401).json({
            success: false,
            error: { code: 'UNAUTHENTICATED', message: 'User not authenticated' },
          });
        }
        const userId = authReq.user.id;

        const game = await resolveGame(slug);
        if (!game) {
          return res.status(404).json({
            success: false,
            error: { code: 'GAME_NOT_FOUND', message: 'Game not found' },
          });
        }

        const [userReview] = await catalogDb
          .select({
            id: reviews.id,
            userId: reviews.userId,
            userName: reviews.userName,
            sentiment: reviews.sentiment,
            content: reviews.content,
            createdAt: reviews.createdAt,
            updatedAt: reviews.updatedAt,
          })
          .from(reviews)
          .innerJoin(gameReviews, eq(reviews.id, gameReviews.reviewId))
          .where(and(eq(gameReviews.gameId, game.id), eq(reviews.userId, userId)))
          .limit(1);

        res.status(200).json({
          success: true,
          data: {
            review: userReview || null,
          },
        });
      } catch (error) {
        console.error('Error fetching user review:', error);
        res.status(500).json({
          success: false,
          error: { code: 'INTERNAL_SERVER_ERROR', message: 'Failed to fetch user review' },
        });
      }
    }
  );

  // POST /store/games/:slug/reviews - Create or update user review
  app.post(
    '/store/games/:slug/reviews',
    requireAuth,
    requireRole('gamer'),
    async (req: Request, res: Response) => {
      try {
        const { slug } = req.params;
        const authReq = req as AuthenticatedRequest;
        if (!authReq.user) {
          return res.status(401).json({
            success: false,
            error: { code: 'UNAUTHENTICATED', message: 'User not authenticated' },
          });
        }
        const userId = authReq.user.id;
        const { sentiment, content, userName } = req.body || {};

        if (!sentiment || !['positive', 'mixed', 'negative'].includes(sentiment)) {
          return res.status(400).json({
            success: false,
            error: {
              code: 'INVALID_SENTIMENT',
              message: "Sentiment must be 'positive', 'mixed', or 'negative'",
            },
          });
        }

        if (typeof content !== 'string' || !content.trim()) {
          return res.status(400).json({
            success: false,
            error: { code: 'INVALID_CONTENT', message: 'Review content is required' },
          });
        }

        const game = await resolveGame(slug);
        if (!game) {
          return res.status(404).json({
            success: false,
            error: { code: 'GAME_NOT_FOUND', message: 'Game not found' },
          });
        }

        // Check if review already exists for this user on this game
        const [existingReview] = await catalogDb
          .select({
            id: reviews.id,
          })
          .from(reviews)
          .innerJoin(gameReviews, eq(reviews.id, gameReviews.reviewId))
          .where(and(eq(gameReviews.gameId, game.id), eq(reviews.userId, userId)))
          .limit(1);

        let finalReview;

        if (existingReview) {
          // Update existing review
          const [updated] = await catalogDb
            .update(reviews)
            .set({
              sentiment,
              content: content.trim(),
              ...(userName ? { userName } : {}),
              updatedAt: new Date(),
            })
            .where(eq(reviews.id, existingReview.id))
            .returning();
          finalReview = updated;
        } else {
          // Insert new review & link to gameReviews
          const [created] = await catalogDb
            .insert(reviews)
            .values({
              userId,
              userName: userName || null,
              sentiment,
              content: content.trim(),
            })
            .returning();

          await catalogDb.insert(gameReviews).values({
            gameId: game.id,
            reviewId: created.id,
          });

          finalReview = created;
        }

        res.status(200).json({
          success: true,
          data: {
            review: finalReview,
          },
        });
      } catch (error) {
        console.error('Error submitting review:', error);
        res.status(500).json({
          success: false,
          error: { code: 'INTERNAL_SERVER_ERROR', message: 'Failed to submit review' },
        });
      }
    }
  );

  return app;
}
