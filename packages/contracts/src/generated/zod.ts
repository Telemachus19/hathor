import { makeApi, Zodios, type ZodiosOptions } from '@zodios/core';
import { z } from 'zod';

const RegisterRequest = z
  .object({
    email: z.string().max(255).email(),
    password: z.string().min(12).max(128),
    displayName: z.string().min(3).max(100),
    captchaToken: z.string().min(1).max(4096),
  })
  .passthrough();
const Uuid = z.string();
const User = z
  .object({
    id: Uuid.uuid(),
    email: z.string().email(),
    displayName: z.string(),
    roles: z.array(z.enum(['gamer', 'creator', 'admin'])),
    status: z.enum(['active', 'suspended', 'banned']),
    lastLoginAt: z.union([z.string(), z.null()]).optional(),
    createdAt: z.string().datetime({ offset: true }).optional(),
  })
  .passthrough();
const Error = z
  .object({
    error: z
      .object({ code: z.string(), message: z.string(), correlationId: Uuid.uuid() })
      .passthrough(),
  })
  .passthrough();
const LoginRequest = z
  .object({ email: z.string().email(), password: z.string().min(1).max(128) })
  .passthrough();
const AuthSession = z.object({ accessToken: z.string(), user: User }).passthrough();
const ThemeDocument = z.object({
  schemaVersion: z.number().int(),
  palette: z.object({
    background: z.string().regex(/^#[0-9A-Fa-f]{6}$/),
    surface: z.string().regex(/^#[0-9A-Fa-f]{6}$/),
    text: z.string().regex(/^#[0-9A-Fa-f]{6}$/),
    accent: z.string().regex(/^#[0-9A-Fa-f]{6}$/),
  }),
  typography: z.object({
    headingFont: z.enum(['inter', 'cairo']),
    bodyFont: z.enum(['inter', 'cairo']),
    headingScale: z.enum(['normal', 'large']),
  }),
  layout: z.object({
    template: z.enum(['standard', 'cinematic', 'compact']),
    heroAlignment: z.enum(['left', 'center']),
    cardStyle: z.enum(['flat', 'elevated']),
    showTrailer: z.boolean().optional().default(true),
  }),
  contentOrder: z
    .array(z.enum(['hero', 'description', 'screenshots', 'systemRequirements']))
    .max(4),
});
const Genre = z
  .object({ id: z.number().int(), name: z.string().max(50), slug: z.string().max(50) })
  .passthrough();
const Game = z
  .object({
    id: Uuid.uuid(),
    slug: z.string(),
    title: z.string(),
    shortDescription: z.string().optional(),
    priceEgp: z.string().regex(/^\d+\.\d{2}$/),
    currency: z.string(),
    status: z.enum(['draft', 'pending_review', 'published', 'rejected', 'suspended']),
    theme: ThemeDocument,
    genreId: z.union([z.number(), z.null()]).optional(),
    genre: z.union([Genre, z.null()]).optional(),
  })
  .passthrough();
const GamePage = z
  .object({ items: z.array(Game), nextCursor: z.union([z.string(), z.null()]).optional() })
  .passthrough();
const Cart = z
  .object({
    version: z.number().int().gte(1),
    items: z.array(z.object({ gameId: Uuid.uuid() }).passthrough()),
  })
  .passthrough();
const InitializeTransactionRequest = z
  .object({
    paymentMethod: z.enum(['sim_fawry', 'sim_vodafone_cash', 'sim_instapay']),
    cartVersion: z.number().int().gte(1),
  })
  .passthrough();
const Order = z
  .object({
    id: Uuid.uuid(),
    status: z.enum([
      'payment_pending',
      'payment_confirmed',
      'fulfillment_pending',
      'fulfilled',
      'expired',
      'payment_failed',
      'cancelled',
      'revoked',
    ]),
    paymentMethod: z.enum(['sim_fawry', 'sim_vodafone_cash', 'sim_instapay']),
    paymentReference: z.string().optional(),
    totalAmountEgp: z.string().regex(/^\d+\.\d{2}$/),
    currency: z.string(),
    expiresAt: z.string().datetime({ offset: true }),
  })
  .passthrough();
const SimulatePaymentRequest = z.object({ outcome: z.enum(['paid', 'failed']) });
const SimulatorWebhook = z
  .object({
    eventId: Uuid.uuid(),
    occurredAt: z.string().datetime({ offset: true }),
    merchantId: z.string(),
    orderReference: z.string(),
    amountEgp: z.string().regex(/^\d+\.\d{2}$/),
    currency: z.string(),
    status: z.enum(['paid', 'failed']),
  })
  .passthrough();
const Library = z
  .object({
    items: z.array(
      z
        .object({ gameId: Uuid.uuid(), acquiredAt: z.string().datetime({ offset: true }) })
        .passthrough()
    ),
  })
  .passthrough();
const DownloadToken = z
  .object({
    url: z.string().url(),
    expiresAt: z.string().datetime({ offset: true }),
    sha256: z.string().regex(/^[A-Fa-f0-9]{64}$/),
  })
  .passthrough();
const CreateGameRequest = z
  .object({
    title: z.string().min(1).max(255),
    slug: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
    shortDescription: z.string().min(1).max(500),
    priceEgp: z.string().regex(/^\d+\.\d{2}$/),
  })
  .passthrough();
const GameStatusChangeRequest = z
  .object({
    status: z.enum(['published', 'rejected', 'suspended']),
    reason: z.string().max(500).optional(),
  })
  .passthrough();
const AiThemeProposalRequest = z.object({
  prompt: z.string().min(1).max(1000),
  currentTheme: ThemeDocument,
});
const AiThemeProposal = z.object({
  summary: z.string().max(500),
  patch: z
    .array(
      z.object({
        op: z.string(),
        path: z.enum([
          '/palette/background',
          '/palette/surface',
          '/palette/text',
          '/palette/accent',
          '/typography/headingFont',
          '/typography/bodyFont',
          '/typography/headingScale',
          '/layout/template',
          '/layout/heroAlignment',
          '/layout/cardStyle',
          '/layout/showTrailer',
          '/contentOrder',
        ]),
        value: z.unknown(),
      })
    )
    .max(20),
});
const UserPage = z
  .object({ items: z.array(User), nextCursor: z.union([z.string(), z.null()]).optional() })
  .passthrough();
const UserStatusChangeRequest = z
  .object({ status: z.enum(['active', 'suspended', 'banned']) })
  .passthrough();
const RoleChangeRequest = z
  .object({ role: z.enum(['creator', 'admin']), action: z.enum(['grant', 'revoke']) })
  .passthrough();
const OrderPage = z
  .object({ items: z.array(Order), nextCursor: z.union([z.string(), z.null()]).optional() })
  .passthrough();
const GenrePage = z.object({ items: z.array(Genre) }).passthrough();
const createGenre_Body = z.object({ name: z.string(), slug: z.string() }).passthrough();
const updateGenre_Body = z.object({ name: z.string(), slug: z.string() }).partial().passthrough();
const Tag = z
  .object({ id: z.number().int(), name: z.string().max(50), slug: z.string().max(50) })
  .passthrough();
const TagPage = z.object({ items: z.array(Tag) }).passthrough();
const CatalogAuditLog = z
  .object({
    id: Uuid.uuid(),
    actorId: z.union([z.string(), z.null()]).optional(),
    targetType: z.string(),
    targetId: z.string(),
    action: z.string(),
    details: z.object({}).partial().passthrough().optional(),
    timestamp: z.string().datetime({ offset: true }),
  })
  .passthrough();
const AuditLogPage = z
  .object({
    items: z.array(CatalogAuditLog),
    nextCursor: z.union([z.string(), z.null()]).optional(),
  })
  .passthrough();
const AnalyticsData = z
  .object({
    totalOwners: z.number().int(),
    totalRevenueEgp: z.string(),
    averageScore: z.number(),
    lifetimePurchases: z.number().int(),
    monthlyPurchases: z.array(
      z
        .object({ month: z.number().int(), year: z.number().int(), amount: z.number().int() })
        .passthrough()
    ),
  })
  .passthrough();
const AuditLog = z
  .object({
    id: z.string().uuid(),
    timestamp: z.string().datetime({ offset: true }),
    actorId: z.string().uuid(),
    targetId: z.string().optional(),
    action: z.string(),
    details: z.object({}).partial().passthrough().optional(),
    service: z.string(),
  })
  .passthrough();
const AuditLogList = z.object({ items: z.array(AuditLog) }).passthrough();

export const schemas = {
  RegisterRequest,
  Uuid,
  User,
  Error,
  LoginRequest,
  AuthSession,
  ThemeDocument,
  Genre,
  Game,
  GamePage,
  Cart,
  InitializeTransactionRequest,
  Order,
  SimulatePaymentRequest,
  SimulatorWebhook,
  Library,
  DownloadToken,
  CreateGameRequest,
  GameStatusChangeRequest,
  AiThemeProposalRequest,
  AiThemeProposal,
  UserPage,
  UserStatusChangeRequest,
  RoleChangeRequest,
  OrderPage,
  GenrePage,
  createGenre_Body,
  updateGenre_Body,
  Tag,
  TagPage,
  CatalogAuditLog,
  AuditLogPage,
  AnalyticsData,
  AuditLog,
  AuditLogList,
};

const endpoints = makeApi([
  {
    method: 'get',
    path: '/admin/audit-logs',
    alias: 'listAuditLogs',
    requestFormat: 'json',
    parameters: [
      {
        name: 'cursor',
        type: 'Query',
        schema: z.string().optional(),
      },
      {
        name: 'limit',
        type: 'Query',
        schema: z.number().int().gte(1).lte(100).optional().default(25),
      },
    ],
    response: AuditLogPage,
    errors: [
      {
        status: 403,
        description: `Authenticated caller lacks required role or object ownership`,
        schema: Error,
      },
    ],
  },
  {
    method: 'get',
    path: '/admin/games',
    alias: 'listAllGames',
    requestFormat: 'json',
    parameters: [
      {
        name: 'cursor',
        type: 'Query',
        schema: z.string().optional(),
      },
      {
        name: 'limit',
        type: 'Query',
        schema: z.number().int().gte(1).lte(100).optional().default(25),
      },
    ],
    response: GamePage,
    errors: [
      {
        status: 403,
        description: `Authenticated caller lacks required role or object ownership`,
        schema: Error,
      },
    ],
  },
  {
    method: 'patch',
    path: '/admin/games/:gameId/status',
    alias: 'moderateGameStatus',
    requestFormat: 'json',
    parameters: [
      {
        name: 'body',
        type: 'Body',
        schema: GameStatusChangeRequest,
      },
      {
        name: 'gameId',
        type: 'Path',
        schema: z.string().uuid(),
      },
    ],
    response: z.void(),
    errors: [
      {
        status: 403,
        description: `Authenticated caller lacks required role or object ownership`,
        schema: Error,
      },
      {
        status: 409,
        description: `Invalid state, duplicate request, already-owned game, or disallowed transition`,
        schema: Error,
      },
    ],
  },
  {
    method: 'get',
    path: '/admin/genres',
    alias: 'listGenres',
    requestFormat: 'json',
    response: GenrePage,
    errors: [
      {
        status: 403,
        description: `Authenticated caller lacks required role or object ownership`,
        schema: Error,
      },
    ],
  },
  {
    method: 'post',
    path: '/admin/genres',
    alias: 'createGenre',
    requestFormat: 'json',
    parameters: [
      {
        name: 'body',
        type: 'Body',
        schema: createGenre_Body,
      },
    ],
    response: Genre,
    errors: [
      {
        status: 403,
        description: `Authenticated caller lacks required role or object ownership`,
        schema: Error,
      },
    ],
  },
  {
    method: 'put',
    path: '/admin/genres/:genreId',
    alias: 'updateGenre',
    requestFormat: 'json',
    parameters: [
      {
        name: 'body',
        type: 'Body',
        schema: updateGenre_Body,
      },
      {
        name: 'genreId',
        type: 'Path',
        schema: z.number().int(),
      },
    ],
    response: Genre,
    errors: [
      {
        status: 403,
        description: `Authenticated caller lacks required role or object ownership`,
        schema: Error,
      },
    ],
  },
  {
    method: 'delete',
    path: '/admin/genres/:genreId',
    alias: 'deleteGenre',
    requestFormat: 'json',
    parameters: [
      {
        name: 'genreId',
        type: 'Path',
        schema: z.number().int(),
      },
    ],
    response: z.void(),
    errors: [
      {
        status: 403,
        description: `Authenticated caller lacks required role or object ownership`,
        schema: Error,
      },
    ],
  },
  {
    method: 'get',
    path: '/admin/submissions',
    alias: 'listSubmissions',
    requestFormat: 'json',
    response: GamePage,
    errors: [
      {
        status: 403,
        description: `Authenticated caller lacks required role or object ownership`,
        schema: Error,
      },
    ],
  },
  {
    method: 'get',
    path: '/admin/tags',
    alias: 'listTags',
    requestFormat: 'json',
    response: TagPage,
    errors: [
      {
        status: 403,
        description: `Authenticated caller lacks required role or object ownership`,
        schema: Error,
      },
    ],
  },
  {
    method: 'post',
    path: '/admin/tags',
    alias: 'createTag',
    requestFormat: 'json',
    parameters: [
      {
        name: 'body',
        type: 'Body',
        schema: createGenre_Body,
      },
    ],
    response: Tag,
    errors: [
      {
        status: 403,
        description: `Authenticated caller lacks required role or object ownership`,
        schema: Error,
      },
    ],
  },
  {
    method: 'put',
    path: '/admin/tags/:tagId',
    alias: 'updateTag',
    requestFormat: 'json',
    parameters: [
      {
        name: 'body',
        type: 'Body',
        schema: updateGenre_Body,
      },
      {
        name: 'tagId',
        type: 'Path',
        schema: z.number().int(),
      },
    ],
    response: Tag,
    errors: [
      {
        status: 403,
        description: `Authenticated caller lacks required role or object ownership`,
        schema: Error,
      },
    ],
  },
  {
    method: 'delete',
    path: '/admin/tags/:tagId',
    alias: 'deleteTag',
    requestFormat: 'json',
    parameters: [
      {
        name: 'tagId',
        type: 'Path',
        schema: z.number().int(),
      },
    ],
    response: z.void(),
    errors: [
      {
        status: 403,
        description: `Authenticated caller lacks required role or object ownership`,
        schema: Error,
      },
    ],
  },
  {
    method: 'get',
    path: '/admin/transactions',
    alias: 'listTransactions',
    requestFormat: 'json',
    parameters: [
      {
        name: 'cursor',
        type: 'Query',
        schema: z.string().optional(),
      },
      {
        name: 'limit',
        type: 'Query',
        schema: z.number().int().gte(1).lte(100).optional().default(25),
      },
    ],
    response: OrderPage,
    errors: [
      {
        status: 403,
        description: `Authenticated caller lacks required role or object ownership`,
        schema: Error,
      },
    ],
  },
  {
    method: 'get',
    path: '/admin/users',
    alias: 'listUsers',
    requestFormat: 'json',
    parameters: [
      {
        name: 'cursor',
        type: 'Query',
        schema: z.string().optional(),
      },
      {
        name: 'limit',
        type: 'Query',
        schema: z.number().int().gte(1).lte(100).optional().default(25),
      },
    ],
    response: UserPage,
    errors: [
      {
        status: 403,
        description: `Authenticated caller lacks required role or object ownership`,
        schema: Error,
      },
    ],
  },
  {
    method: 'post',
    path: '/admin/users/:userId/roles',
    alias: 'grantRole',
    requestFormat: 'json',
    parameters: [
      {
        name: 'body',
        type: 'Body',
        schema: RoleChangeRequest,
      },
      {
        name: 'userId',
        type: 'Path',
        schema: z.string().uuid(),
      },
    ],
    response: z.void(),
    errors: [
      {
        status: 403,
        description: `Authenticated caller lacks required role or object ownership`,
        schema: Error,
      },
    ],
  },
  {
    method: 'patch',
    path: '/admin/users/:userId/status',
    alias: 'updateUserStatus',
    requestFormat: 'json',
    parameters: [
      {
        name: 'body',
        type: 'Body',
        schema: UserStatusChangeRequest,
      },
      {
        name: 'userId',
        type: 'Path',
        schema: z.string().uuid(),
      },
    ],
    response: z.void(),
    errors: [
      {
        status: 403,
        description: `Authenticated caller lacks required role or object ownership`,
        schema: Error,
      },
    ],
  },
  {
    method: 'get',
    path: '/cart',
    alias: 'getCart',
    requestFormat: 'json',
    response: Cart,
    errors: [
      {
        status: 401,
        description: `Missing, invalid, expired, or revoked credentials`,
        schema: Error,
      },
    ],
  },
  {
    method: 'post',
    path: '/cart/:gameId',
    alias: 'addCartItem',
    requestFormat: 'json',
    parameters: [
      {
        name: 'gameId',
        type: 'Path',
        schema: z.string().uuid(),
      },
    ],
    response: Cart,
    errors: [
      {
        status: 401,
        description: `Missing, invalid, expired, or revoked credentials`,
        schema: Error,
      },
      {
        status: 409,
        description: `Invalid state, duplicate request, already-owned game, or disallowed transition`,
        schema: Error,
      },
    ],
  },
  {
    method: 'delete',
    path: '/cart/:gameId',
    alias: 'removeCartItem',
    requestFormat: 'json',
    parameters: [
      {
        name: 'gameId',
        type: 'Path',
        schema: z.string().uuid(),
      },
    ],
    response: Cart,
    errors: [
      {
        status: 401,
        description: `Missing, invalid, expired, or revoked credentials`,
        schema: Error,
      },
    ],
  },
  {
    method: 'get',
    path: '/creator/games',
    alias: 'listCreatorGames',
    requestFormat: 'json',
    response: z.array(Game),
    errors: [
      {
        status: 401,
        description: `Missing, invalid, expired, or revoked credentials`,
        schema: Error,
      },
    ],
  },
  {
    method: 'post',
    path: '/creator/games',
    alias: 'createCreatorGame',
    requestFormat: 'json',
    parameters: [
      {
        name: 'body',
        type: 'Body',
        schema: CreateGameRequest,
      },
    ],
    response: Game,
    errors: [
      {
        status: 403,
        description: `Authenticated caller lacks required role or object ownership`,
        schema: Error,
      },
    ],
  },
  {
    method: 'post',
    path: '/creator/games/:gameId/ai/theme-proposals',
    alias: 'proposeAiTheme',
    requestFormat: 'json',
    parameters: [
      {
        name: 'body',
        type: 'Body',
        schema: AiThemeProposalRequest,
      },
      {
        name: 'gameId',
        type: 'Path',
        schema: z.string().uuid(),
      },
    ],
    response: AiThemeProposal,
    errors: [
      {
        status: 403,
        description: `Authenticated caller lacks required role or object ownership`,
        schema: Error,
      },
      {
        status: 503,
        description: `Required internal service unavailable`,
        schema: Error,
      },
    ],
  },
  {
    method: 'get',
    path: '/creator/games/:gameId/analytics',
    alias: 'getGameAnalytics',
    requestFormat: 'json',
    parameters: [
      {
        name: 'gameId',
        type: 'Path',
        schema: z.string().uuid(),
      },
    ],
    response: AnalyticsData,
    errors: [
      {
        status: 401,
        description: `Missing, invalid, expired, or revoked credentials`,
        schema: Error,
      },
      {
        status: 403,
        description: `Authenticated caller lacks required role or object ownership`,
        schema: Error,
      },
    ],
  },
  {
    method: 'patch',
    path: '/creator/games/:gameId/status',
    alias: 'updateCreatorGameStatus',
    requestFormat: 'json',
    parameters: [
      {
        name: 'body',
        type: 'Body',
        schema: GameStatusChangeRequest,
      },
      {
        name: 'gameId',
        type: 'Path',
        schema: z.string().uuid(),
      },
    ],
    response: z.void(),
    errors: [
      {
        status: 403,
        description: `Authenticated caller lacks required role or object ownership`,
        schema: Error,
      },
      {
        status: 409,
        description: `Invalid state, duplicate request, already-owned game, or disallowed transition`,
        schema: Error,
      },
    ],
  },
  {
    method: 'put',
    path: '/creator/games/:gameId/theme',
    alias: 'updateCreatorTheme',
    requestFormat: 'json',
    parameters: [
      {
        name: 'body',
        type: 'Body',
        schema: ThemeDocument,
      },
      {
        name: 'gameId',
        type: 'Path',
        schema: z.string().uuid(),
      },
    ],
    response: z.void(),
    errors: [
      {
        status: 403,
        description: `Authenticated caller lacks required role or object ownership`,
        schema: Error,
      },
    ],
  },
  {
    method: 'get',
    path: '/inventory/apps',
    alias: 'listLibraryGames',
    requestFormat: 'json',
    response: Library,
    errors: [
      {
        status: 401,
        description: `Missing, invalid, expired, or revoked credentials`,
        schema: Error,
      },
    ],
  },
  {
    method: 'get',
    path: '/inventory/check/:gameId',
    alias: 'checkLibraryOwnership',
    requestFormat: 'json',
    parameters: [
      {
        name: 'gameId',
        type: 'Path',
        schema: z.string().uuid(),
      },
    ],
    response: z.object({ gameId: Uuid.uuid(), owned: z.boolean() }).passthrough(),
    errors: [
      {
        status: 401,
        description: `Missing, invalid, expired, or revoked credentials`,
        schema: Error,
      },
    ],
  },
  {
    method: 'post',
    path: '/inventory/games/:gameId/download',
    alias: 'issueDownloadToken',
    requestFormat: 'json',
    parameters: [
      {
        name: 'gameId',
        type: 'Path',
        schema: z.string().uuid(),
      },
    ],
    response: DownloadToken,
    errors: [
      {
        status: 400,
        description: `Invalid request`,
        schema: Error,
      },
      {
        status: 401,
        description: `Missing, invalid, expired, or revoked credentials`,
        schema: Error,
      },
      {
        status: 403,
        description: `Authenticated caller lacks required role or object ownership`,
        schema: Error,
      },
      {
        status: 404,
        description: `Resource not found`,
        schema: Error,
      },
      {
        status: 503,
        description: `Required internal service unavailable`,
        schema: Error,
      },
    ],
  },
  {
    method: 'get',
    path: '/store/games',
    alias: 'listGames',
    requestFormat: 'json',
    parameters: [
      {
        name: 'query',
        type: 'Query',
        schema: z.string().max(100).optional(),
      },
      {
        name: 'tag',
        type: 'Query',
        schema: z.string().max(50).optional(),
      },
      {
        name: 'cursor',
        type: 'Query',
        schema: z.string().optional(),
      },
      {
        name: 'limit',
        type: 'Query',
        schema: z.number().int().gte(1).lte(50).optional().default(20),
      },
    ],
    response: GamePage,
    errors: [
      {
        status: 400,
        description: `Invalid request`,
        schema: Error,
      },
    ],
  },
  {
    method: 'get',
    path: '/store/games/:slug',
    alias: 'getGameBySlug',
    requestFormat: 'json',
    parameters: [
      {
        name: 'slug',
        type: 'Path',
        schema: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
      },
    ],
    response: Game,
    errors: [
      {
        status: 404,
        description: `Resource not found`,
        schema: Error,
      },
    ],
  },
  {
    method: 'get',
    path: '/txn/:orderId',
    alias: 'getOrder',
    requestFormat: 'json',
    parameters: [
      {
        name: 'orderId',
        type: 'Path',
        schema: z.string().uuid(),
      },
    ],
    response: Order,
    errors: [
      {
        status: 404,
        description: `Resource not found`,
        schema: Error,
      },
    ],
  },
  {
    method: 'post',
    path: '/txn/:orderId/simulate-payment',
    alias: 'simulatePayment',
    requestFormat: 'json',
    parameters: [
      {
        name: 'body',
        type: 'Body',
        schema: SimulatePaymentRequest,
      },
      {
        name: 'orderId',
        type: 'Path',
        schema: z.string().uuid(),
      },
    ],
    response: z.void(),
    errors: [
      {
        status: 403,
        description: `Authenticated caller lacks required role or object ownership`,
        schema: Error,
      },
      {
        status: 409,
        description: `Invalid state, duplicate request, already-owned game, or disallowed transition`,
        schema: Error,
      },
    ],
  },
  {
    method: 'post',
    path: '/txn/init',
    alias: 'initializeTransaction',
    requestFormat: 'json',
    parameters: [
      {
        name: 'body',
        type: 'Body',
        schema: InitializeTransactionRequest,
      },
      {
        name: 'Idempotency-Key',
        type: 'Header',
        schema: z.string().uuid(),
      },
    ],
    response: Order,
    errors: [
      {
        status: 409,
        description: `Invalid state, duplicate request, already-owned game, or disallowed transition`,
        schema: Error,
      },
      {
        status: 503,
        description: `Required internal service unavailable`,
        schema: Error,
      },
    ],
  },
  {
    method: 'post',
    path: '/txn/webhooks/simulator',
    alias: 'receiveSimulatorWebhook',
    requestFormat: 'json',
    parameters: [
      {
        name: 'body',
        type: 'Body',
        schema: SimulatorWebhook,
      },
      {
        name: 'X-Hathor-Signature',
        type: 'Header',
        schema: z.string(),
      },
    ],
    response: z.void(),
    errors: [
      {
        status: 401,
        description: `Invalid signature`,
        schema: z.void(),
      },
      {
        status: 422,
        description: `Invalid request`,
        schema: Error,
      },
    ],
  },
  {
    method: 'post',
    path: '/user/login',
    alias: 'loginUser',
    requestFormat: 'json',
    parameters: [
      {
        name: 'body',
        type: 'Body',
        schema: LoginRequest,
      },
    ],
    response: AuthSession,
    errors: [
      {
        status: 401,
        description: `Missing, invalid, expired, or revoked credentials`,
        schema: Error,
      },
    ],
  },
  {
    method: 'post',
    path: '/user/logout',
    alias: 'logoutUser',
    requestFormat: 'json',
    response: z.void(),
    errors: [
      {
        status: 401,
        description: `Missing, invalid, expired, or revoked credentials`,
        schema: Error,
      },
    ],
  },
  {
    method: 'get',
    path: '/user/me',
    alias: 'getCurrentUser',
    requestFormat: 'json',
    response: User,
    errors: [
      {
        status: 401,
        description: `Missing, invalid, expired, or revoked credentials`,
        schema: Error,
      },
    ],
  },
  {
    method: 'post',
    path: '/user/refresh',
    alias: 'refreshSession',
    requestFormat: 'json',
    response: AuthSession,
    errors: [
      {
        status: 401,
        description: `Missing, invalid, expired, or revoked credentials`,
        schema: Error,
      },
    ],
  },
  {
    method: 'post',
    path: '/user/register',
    alias: 'registerUser',
    requestFormat: 'json',
    parameters: [
      {
        name: 'body',
        type: 'Body',
        schema: RegisterRequest,
      },
    ],
    response: User,
    errors: [
      {
        status: 409,
        description: `Invalid state, duplicate request, already-owned game, or disallowed transition`,
        schema: Error,
      },
      {
        status: 422,
        description: `Invalid request`,
        schema: Error,
      },
    ],
  },
]);

export const api = new Zodios(endpoints);

export function createApiClient(baseUrl: string, options?: ZodiosOptions) {
  return new Zodios(baseUrl, endpoints, options);
}
