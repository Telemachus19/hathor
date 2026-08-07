import {
  decimal,
  index,
  integer,
  jsonb,
  pgSchema,
  primaryKey,
  timestamp,
  uuid,
  varchar,
} from 'drizzle-orm/pg-core';

export const commerceSchema = pgSchema('commerce');

export const carts = commerceSchema.table('carts', {
  userId: uuid('user_id').primaryKey(),
  version: integer('version').default(1).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
});

export const cartItems = commerceSchema.table(
  'cart_items',
  {
    userId: uuid('user_id')
      .notNull()
      .references(() => carts.userId, { onDelete: 'cascade' }),
    gameId: uuid('game_id').notNull(),
    addedAt: timestamp('added_at', { withTimezone: true }).defaultNow(),
  },
  (table) => ({
    pk: primaryKey({ columns: [table.userId, table.gameId] }),
  })
);

export const orders = commerceSchema.table(
  'orders',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    userId: uuid('user_id').notNull(),
    idempotencyKey: varchar('idempotency_key', { length: 36 }).unique(),
    cartVersion: integer('cart_version'),
    totalAmountEgp: decimal('total_amount_egp', { precision: 10, scale: 2 }).notNull(),
    currency: varchar('currency', { length: 5 }).default('EGP').notNull(),
    paymentMethod: varchar('payment_method', { length: 30 }).notNull(),
    paymentReference: varchar('payment_reference', { length: 100 }).unique().notNull(),
    status: varchar('status', { length: 30 }).default('payment_pending'),
    expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  },
  (table) => ({
    userStatusIdx: index('idx_orders_user_status').on(table.userId, table.status),
    paymentRefIdx: index('idx_orders_payment_ref').on(table.paymentReference),
  })
);

export const orderItems = commerceSchema.table(
  'order_items',
  {
    orderId: uuid('order_id')
      .notNull()
      .references(() => orders.id, { onDelete: 'cascade' }),
    gameId: uuid('game_id').notNull(),
    titleSnapshot: varchar('title_snapshot', { length: 255 }).default('').notNull(),
    pricePaidEgp: decimal('price_paid_egp', { precision: 10, scale: 2 }).notNull(),
    priceVersionSnapshot: varchar('price_version_snapshot', { length: 50 }),
    currency: varchar('currency', { length: 5 }).default('EGP').notNull(),
  },
  (table) => ({
    pk: primaryKey({ columns: [table.orderId, table.gameId] }),
  })
);

export const idempotencyRecords = commerceSchema.table('idempotency_records', {
  key: varchar('key', { length: 36 }).primaryKey(),
  userId: uuid('user_id').notNull(),
  requestHash: varchar('request_hash', { length: 64 }).notNull(),
  orderId: uuid('order_id')
    .notNull()
    .references(() => orders.id, { onDelete: 'cascade' }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
});

export const orderStateTransitions = commerceSchema.table('order_state_transitions', {
  id: uuid('id').defaultRandom().primaryKey(),
  orderId: uuid('order_id')
    .notNull()
    .references(() => orders.id, { onDelete: 'cascade' }),
  fromStatus: varchar('from_status', { length: 30 }),
  toStatus: varchar('to_status', { length: 30 }).notNull(),
  correlationId: uuid('correlation_id'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
});

export const outboxEvents = commerceSchema.table(
  'outbox_events',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    aggregateType: varchar('aggregate_type', { length: 50 }).notNull(),
    aggregateId: uuid('aggregate_id').notNull(),
    eventType: varchar('event_type', { length: 100 }).notNull(),
    payload: jsonb('payload').notNull(),
    status: varchar('status', { length: 20 }).default('PENDING').notNull(),
    retryCount: integer('retry_count').default(0).notNull(),
    lastError: varchar('last_error', { length: 1000 }),
    correlationId: uuid('correlation_id'),
    publishedAt: timestamp('published_at', { withTimezone: true }),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => ({
    outboxStatusIdx: index('idx_outbox_status_created').on(table.status, table.createdAt),
  })
);
