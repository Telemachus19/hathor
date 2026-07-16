import {
  decimal,
  index,
  pgSchema,
  primaryKey,
  timestamp,
  uuid,
  varchar,
} from 'drizzle-orm/pg-core';

export const commerceSchema = pgSchema('commerce');

export const cartItems = commerceSchema.table(
  'cart_items',
  {
    userId: uuid('user_id').notNull(),
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
    totalAmountEgp: decimal('total_amount_egp', { precision: 10, scale: 2 }).notNull(),
    paymentMethod: varchar('payment_method', { length: 30 }).notNull(),
    paymentReference: varchar('payment_reference', { length: 100 }).unique().notNull(),
    status: varchar('status', { length: 30 }).default('created'),
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
    pricePaidEgp: decimal('price_paid_egp', { precision: 10, scale: 2 }).notNull(),
  },
  (table) => ({
    pk: primaryKey({ columns: [table.orderId, table.gameId] }),
  })
);
