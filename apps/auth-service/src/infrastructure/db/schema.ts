import { sql } from 'drizzle-orm';
import { boolean, integer, pgSchema, text, timestamp, uuid, varchar } from 'drizzle-orm/pg-core';

export const authSchema = pgSchema('auth');

export const users = authSchema.table('users', {
  id: uuid('id').defaultRandom().primaryKey(),
  email: varchar('email', { length: 255 }).unique().notNull(),
  passwordHash: varchar('password_hash', { length: 255 }).notNull(),
  displayName: varchar('display_name', { length: 100 }).notNull(),
  roles: text('roles')
    .array()
    .notNull()
    .default(sql`ARRAY['gamer']::text[]`),
  authorizationVersion: integer('authorization_version')
    .notNull()
    .default(1),
  disabled: boolean('disabled')
    .notNull()
    .default(false),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
});

export const refreshTokenFamilies = authSchema.table('refresh_token_families', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  revoked: boolean('revoked').default(false).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
});

export const refreshTokens = authSchema.table('refresh_tokens', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  familyId: uuid('family_id')
    .notNull()
    .references(() => refreshTokenFamilies.id, { onDelete: 'cascade' }),
  tokenHash: varchar('token_hash', { length: 255 }).notNull(),
  expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
  used: boolean('used').default(false).notNull(),
  revoked: boolean('revoked').default(false),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
});

export const roleChangeAudit = authSchema.table('role_change_audit', {
  id: uuid('id').defaultRandom().primaryKey(),
  actorId: uuid('actor_id')
    .references(() => users.id, { onDelete: 'set null' }), // Nullable for bootstrap command
  targetId: uuid('target_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  change: varchar('change', { length: 255 }).notNull(),
  authorizationVersion: integer('authorization_version').notNull(),
  correlationId: uuid('correlation_id').notNull(),
  timestamp: timestamp('timestamp', { withTimezone: true }).defaultNow().notNull(),
});
