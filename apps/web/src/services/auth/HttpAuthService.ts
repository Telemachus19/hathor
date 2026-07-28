import type { ApiClient } from '../api/ApiClient';
import type { AuthService, LoginResult, RegisterInput } from './AuthService';

export class HttpAuthService implements AuthService {
  constructor(private readonly apiClient: ApiClient) {}

  async login(identifier: string, password: string): Promise<LoginResult> {
    const { data } = await this.apiClient.POST('/user/login', {
      body: {
        email: identifier,
        password,
      },
    });

    if (!data) {
      throw new Error('Login failed: empty response data');
    }

    this.apiClient.setAccessToken(data.accessToken);

    return {
      accessToken: data.accessToken,
      user: {
        id: data.user.id,
        email: data.user.email,
        displayName: data.user.displayName,
        roles: data.user.roles as ('gamer' | 'creator' | 'admin')[],
      },
    };
  }

  async register(input: RegisterInput): Promise<void> {
    await this.apiClient.POST('/user/register', {
      body: {
        email: input.email,
        password: input.password,
        displayName: input.displayName,
        captchaToken: (input as any).captchaToken || 'dev-captcha-token',
      },
    });
  }

  async refresh(): Promise<LoginResult> {
    const { data } = await this.apiClient.POST('/user/refresh', {});

    if (!data) {
      throw new Error('Refresh failed: empty response data');
    }

    this.apiClient.setAccessToken(data.accessToken);

    return {
      accessToken: data.accessToken,
      user: {
        id: data.user.id,
        email: data.user.email,
        displayName: data.user.displayName,
        roles: data.user.roles as ('gamer' | 'creator' | 'admin')[],
      },
    };
  }

  async logout(): Promise<void> {
    try {
      await this.apiClient.POST('/user/logout', {});
    } finally {
      this.apiClient.setAccessToken(null);
    }
  }
}
