import { pgSchema, uuid, decimal, timestamp, primaryKey } from 'drizzle-orm/pg-core';
import { users } from './auth.js';
import { games } from './catalog.js';

export const librarySchema = pgSchema('library');

export const userLicenses = librarySchema.table(
  'user_licenses',
  {
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    gameId: uuid('game_id')
      .notNull()
      .references(() => games.id, { onDelete: 'cascade' }),
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
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    gameId: uuid('game_id')
      .notNull()
      .references(() => games.id, { onDelete: 'cascade' }),
    addedAt: timestamp('added_at', { withTimezone: true }).defaultNow(),
  },
  (table) => ({
    pk: primaryKey({ columns: [table.userId, table.gameId] }),
  })
);
