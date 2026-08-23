import {
  decimal,
  index,
  integer,
  jsonb,
  pgSchema,
  text,
  timestamp,
  uuid,
  varchar,
} from 'drizzle-orm/pg-core';

export const catalogSchema = pgSchema('catalog');

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
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
  },
  (table) => ({
    slugIdx: index('idx_ai_games_slug').on(table.slug),
    statusPriceIdx: index('idx_ai_games_status_price').on(table.status, table.priceEgp),
  })
);

export const gameEmbeddings = catalogSchema.table(
  'game_embeddings',
  {
    gameId: uuid('game_id')
      .primaryKey()
      .references(() => games.id, { onDelete: 'cascade' }),
    embedding: jsonb('embedding').notNull(),
    contentHash: varchar('content_hash', { length: 64 }).notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
  },
  (table) => ({
    gameIdx: index('idx_ai_game_embeddings_game_id').on(table.gameId),
  })
);
