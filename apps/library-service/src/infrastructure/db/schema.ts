import { decimal, pgSchema, primaryKey, timestamp, uuid } from 'drizzle-orm/pg-core';

export const librarySchema = pgSchema('library');

export const userLicenses = librarySchema.table(
  'user_licenses',
  {
    userId: uuid('user_id').notNull(),
    gameId: uuid('game_id').notNull(),
    sourceOrderId: uuid('source_order_id').notNull(),
    pricePaidEgp: decimal('price_paid_egp', { precision: 10, scale: 2 }).notNull(),
    acquiredAt: timestamp('acquired_at', { withTimezone: true }).defaultNow(),
  },
  (table) => ({
    pk: primaryKey({ columns: [table.userId, table.gameId] }),
  })
);

export const userWishlists = librarySchema.table(
  'user_wishlists',
  {
    userId: uuid('user_id').notNull(),
    gameId: uuid('game_id').notNull(),
    addedAt: timestamp('added_at', { withTimezone: true }).defaultNow(),
  },
  (table) => ({
    pk: primaryKey({ columns: [table.userId, table.gameId] }),
  })
);
