export type { ApiError, ApiErrorDetail, ApiSuccess, HealthStatus } from './http.js';
export type { DomainEventEnvelope } from './events.js';
<<<<<<< Updated upstream

export { ApiClient, createApiClient, GatewayApiError, type ApiClientConfig } from './client.js';

import type { components } from './generated/openapi.js';
export type { paths, components, operations } from './generated/openapi.js';

// Per-operation and component schema types derived from OpenAPI spec
export type RegisterRequest = components['schemas']['RegisterRequest'];
export type LoginRequest = components['schemas']['LoginRequest'];
export type AuthSession = components['schemas']['AuthSession'];
export type User = components['schemas']['User'];
export type Game = components['schemas']['Game'];
export type GamePage = components['schemas']['GamePage'];
export type ThemeDocument = components['schemas']['ThemeDocument'];
export type Cart = components['schemas']['Cart'];
export type InitializeTransactionRequest = components['schemas']['InitializeTransactionRequest'];
export type Order = components['schemas']['Order'];
export type SimulatorWebhook = components['schemas']['SimulatorWebhook'];
export type DownloadTokenRequest = components['schemas']['DownloadTokenRequest'];
export type DownloadToken = components['schemas']['DownloadToken'];
export type CreateGameRequest = components['schemas']['CreateGameRequest'];
export type AiThemeProposalRequest = components['schemas']['AiThemeProposalRequest'];
export type AiThemeProposal = components['schemas']['AiThemeProposal'];
export type RoleChangeRequest = components['schemas']['RoleChangeRequest'];
export type GameStatusChangeRequest = components['schemas']['GameStatusChangeRequest'];
export type ApiErrorResponse = components['schemas']['Error'];
=======
export { ApiClient, createApiClient, GatewayApiError, type ApiClientConfig } from './client.js';
>>>>>>> Stashed changes
