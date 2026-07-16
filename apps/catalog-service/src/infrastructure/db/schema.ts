import {
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
    slugIdx: index('idx_games_slug').on(table.slug),
    statusPriceIdx: index('idx_games_status_price').on(table.status, table.priceEgp),
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
