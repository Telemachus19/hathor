import {
  bigint,
  decimal,
  index,
  integer,
  jsonb,
  pgSchema,
  primaryKey,
  serial,
  text,
  timestamp,
  uuid,
  varchar,
} from 'drizzle-orm/pg-core';

export const catalogSchema = pgSchema('catalog');

export const genres = catalogSchema.table('genres', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 50 }).unique().notNull(),
  slug: varchar('slug', { length: 50 }).unique().notNull(),
});

export const games = catalogSchema.table(
  'games',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    creatorId: uuid('creator_id').notNull(),
    title: varchar('title', { length: 255 }).notNull(),
    slug: varchar('slug', { length: 255 }).unique().notNull(),
    shortDescription: text('short_description').notNull(),
    fullDescription: text('full_description').notNull(),
    priceEgp: decimal('price_egp', { precision: 10, scale: 2 }).notNull().default('0.00'),
    discountPercent: integer('discount_percent').default(0),
    bannerUrl: text('banner_url'),
    screenshots: text('screenshots').array(),
    trailerUrl: text('trailer_url'),
    systemRequirements: jsonb('system_requirements').default({}),
    pageTheme: jsonb('page_theme').default({}),
    status: varchar('status', { length: 20 }).default('draft'),
    genreId: integer('genre_id').references(() => genres.id, { onDelete: 'set null' }),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
  },
  (table) => ({
    slugIdx: index('idx_games_slug').on(table.slug),
    statusPriceIdx: index('idx_games_status_price').on(table.status, table.priceEgp),
    genreIdx: index('idx_games_genre_id').on(table.genreId),
  })
);

export const tags = catalogSchema.table('tags', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 50 }).unique().notNull(),
  slug: varchar('slug', { length: 50 }).unique().notNull(),
});

export const gameTags = catalogSchema.table(
  'game_tags',
  {
    gameId: uuid('game_id')
      .notNull()
      .references(() => games.id, { onDelete: 'cascade' }),
    tagId: integer('tag_id')
      .notNull()
      .references(() => tags.id, { onDelete: 'cascade' }),
  },
  (table) => ({
    pk: primaryKey({ columns: [table.gameId, table.tagId] }),
  })
);

export const gameStatusTransitions = catalogSchema.table(
  'game_status_transitions',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    gameId: uuid('game_id')
      .notNull()
      .references(() => games.id, { onDelete: 'cascade' }),
    actorId: uuid('actor_id').notNull(),
    priorStatus: varchar('prior_status', { length: 20 }).notNull(),
    nextStatus: varchar('next_status', { length: 20 }).notNull(),
    reason: text('reason'),
    correlationId: varchar('correlation_id', { length: 255 }),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  },
  (table) => ({
    gameIdx: index('idx_game_status_transitions_game').on(table.gameId),
  })
);

export const gameBuilds = catalogSchema.table(
  'game_builds',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    gameId: uuid('game_id')
      .notNull()
      .references(() => games.id, { onDelete: 'cascade' }),
    version: varchar('version', { length: 50 }).notNull(),
    objectKey: varchar('object_key', { length: 512 }).notNull(),
    checksumSha256: varchar('checksum_sha256', { length: 64 }).notNull(),
    sizeBytes: bigint('size_bytes', { mode: 'number' }).notNull(),
    state: varchar('state', { length: 20 }).notNull().default('published'),
    publishedAt: timestamp('published_at', { withTimezone: true }).defaultNow(),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  },
  (table) => ({
    gameVersionIdx: index('idx_game_builds_game_version').on(table.gameId, table.version),
    objectKeyIdx: index('idx_game_builds_object_key').on(table.objectKey),
  })
);

export const auditLogs = catalogSchema.table(
  'audit_logs',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    actorId: uuid('actor_id'),
    targetType: varchar('target_type', { length: 50 }).notNull(),
    targetId: varchar('target_id', { length: 255 }).notNull(),
    action: varchar('action', { length: 100 }).notNull(),
    details: jsonb('details').default({}),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  },
  (table) => ({
    targetIdx: index('idx_catalog_audit_target').on(table.targetType, table.targetId),
    actorIdx: index('idx_catalog_audit_actor').on(table.actorId),
  })
);

export const gameEmbeddings = catalogSchema.table(
  'game_embeddings',
  {
    gameId: uuid('game_id')
      .primaryKey()
      .references(() => games.id, { onDelete: 'cascade' }),
    embedding: jsonb('embedding').notNull(), // Stores 1536 float array for vector similarity computation
    contentHash: varchar('content_hash', { length: 64 }).notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
  },
  (table) => ({
    gameIdx: index('idx_game_embeddings_game_id').on(table.gameId),
  })
);

export const catalogRecommendationCache = catalogSchema.table(
  'catalog_recommendation_cache',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    contextGameId: uuid('context_game_id').references(() => games.id, { onDelete: 'cascade' }),
    rankedGameIds: jsonb('ranked_game_ids').notNull().default([]),
    reasons: jsonb('reasons').notNull().default([]),
    source: varchar('source', { length: 50 }).notNull().default('cached'),
    refreshedAt: timestamp('refreshed_at', { withTimezone: true }).defaultNow(),
  },
  (table) => ({
    contextIdx: index('idx_catalog_rec_cache_context').on(table.contextGameId),
  })
);
export const reviews = catalogSchema.table(
  'reviews',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    userId: uuid('user_id').notNull(),
    userName: varchar('user_name', { length: 100 }),
    sentiment: varchar('sentiment', { length: 20 }).notNull(), // 'positive' | 'mixed' | 'negative'
    content: text('content').notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
  },
  (table) => ({
    userIdIdx: index('idx_reviews_user_id').on(table.userId),
    sentimentIdx: index('idx_reviews_sentiment').on(table.sentiment),
  })
);

export const gameReviews = catalogSchema.table(
  'game_reviews',
  {
    gameId: uuid('game_id')
      .notNull()
      .references(() => games.id, { onDelete: 'cascade' }),
    reviewId: uuid('review_id')
      .notNull()
      .references(() => reviews.id, { onDelete: 'cascade' }),
  },
  (table) => ({
    pk: primaryKey({ columns: [table.gameId, table.reviewId] }),
    gameIdIdx: index('idx_game_reviews_game_id').on(table.gameId),
    reviewIdIdx: index('idx_game_reviews_review_id').on(table.reviewId),
  })
);
