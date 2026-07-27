import type { AuthUser } from '../../context/AuthContext';

export type LoginResult = {
  accessToken: string;
  user: AuthUser;
};

export type RegisterInput = {
  displayName: string;
  email: string;
  password: string;
};

export interface AuthService {
  login(
    identifier: string,
    password: string,
  ): Promise<LoginResult>;

  register(
    input: RegisterInput,
  ): Promise<void>;

  refresh(): Promise<LoginResult>;

  logout(): Promise<void>;

  requestPasswordReset(email: string): Promise<void>;

  confirmPasswordReset(token: string, newPassword: string): Promise<void>;

  getGoogleOAuthUrl(): string;
}