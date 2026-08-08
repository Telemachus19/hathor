import {
  decimal,
  integer,
  jsonb,
  pgSchema,
  primaryKey,
  timestamp,
  uuid,
  varchar,
} from 'drizzle-orm/pg-core';

export const librarySchema = pgSchema('library');

export const userLicenses = librarySchema.table(
  'user_licenses',
  {
    userId: uuid('user_id').notNull(),
    gameId: uuid('game_id').notNull(),
    sourceOrderId: uuid('source_order_id').notNull(),
    fulfillmentEventId: uuid('fulfillment_event_id').notNull(),
    pricePaidEgp: decimal('price_paid_egp', { precision: 10, scale: 2 }).notNull(),
    currency: varchar('currency', { length: 5 }).notNull(),
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

export const processedEvents = librarySchema.table('processed_events', {
  eventId: uuid('event_id').primaryKey(),
  eventType: varchar('event_type', { length: 100 }).notNull(),
  correlationId: uuid('correlation_id').notNull(),
  processedAt: timestamp('processed_at', { withTimezone: true }).defaultNow(),
});

export const entitlementAudit = librarySchema.table('entitlement_audit', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').notNull(),
  gameId: uuid('game_id'),
  action: varchar('action', { length: 50 }).notNull(),
  actor: varchar('actor', { length: 50 }).notNull(),
  correlationId: uuid('correlation_id').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
});

export const outboxEvents = librarySchema.table('outbox_events', {
  id: uuid('id').defaultRandom().primaryKey(),
  eventType: varchar('event_type', { length: 100 }).notNull(),
  payload: jsonb('payload').notNull(),
  publishAttempts: integer('publish_attempts').default(0).notNull(),
  status: varchar('status', { length: 30 }).default('pending').notNull(),
  lastError: varchar('last_error', { length: 255 }),
  publishedAt: timestamp('published_at', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
});
