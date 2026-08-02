import {
  decimal,
  index,
  integer,
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
