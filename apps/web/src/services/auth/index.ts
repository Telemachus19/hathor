import { apiClient } from '../api/index';
import type { AuthService } from './AuthService';
import { HttpAuthService } from './HttpAuthService';
import { MockAuthService } from './MockAuthService';

const useMockAuth = import.meta.env.VITE_USE_MOCK_AUTH === 'true';

export const authService: AuthService = useMockAuth
  ? new MockAuthService()
  : new HttpAuthService(apiClient);

export { HttpAuthService } from './HttpAuthService';
export { MockAuthService } from './MockAuthService';
export type { AuthService, LoginResult, RegisterInput } from './AuthService';
