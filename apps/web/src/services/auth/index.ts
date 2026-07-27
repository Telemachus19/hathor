import { ApiClient } from '../api/ApiClient';
import type { AuthService } from './AuthService';
import { HttpAuthService } from './HttpAuthService';
import { MockAuthService } from './MockAuthService';

const apiBaseUrl = (import.meta.env.VITE_API_URL as string) || '';
const useMockAuth = import.meta.env.VITE_USE_MOCK_AUTH === 'true';

const apiClient = new ApiClient({ baseUrl: apiBaseUrl });

export const authService: AuthService = useMockAuth
  ? new MockAuthService()
  : new HttpAuthService(apiClient);

export { HttpAuthService } from './HttpAuthService';
export { MockAuthService } from './MockAuthService';
export type { AuthService, LoginResult, RegisterInput } from './AuthService';