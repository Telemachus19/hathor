import type { ApiClient } from '../api/ApiClient';
import type {
  AuthService,
  LoginResult,
  RegisterInput,
} from './AuthService';

export class HttpAuthService implements AuthService {
  constructor(private readonly apiClient: ApiClient) {}

  async login(identifier: string, password: string): Promise<LoginResult> {
    return this.apiClient.request<LoginResult>('/api/v1/user/login', {
      method: 'POST',
      body: JSON.stringify({ identifier, password }),
    });
  }

  async register(input: RegisterInput): Promise<void> {
    return this.apiClient.request<void>('/api/v1/user/register', {
      method: 'POST',
      body: JSON.stringify(input),
    });
  }

  async refresh(): Promise<LoginResult> {
    return this.apiClient.request<LoginResult>('/api/v1/user/refresh', {
      method: 'POST',
    });
  }

  async logout(): Promise<void> {
    return this.apiClient.request<void>('/api/v1/user/logout', {
      method: 'POST',
    });
  }
}
