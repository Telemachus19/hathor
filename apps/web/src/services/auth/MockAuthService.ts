import type { AuthService, LoginResult, RegisterInput } from './AuthService';
import { GatewayApiError } from '../api/ApiClient';

export class MockAuthService implements AuthService {
  private registeredEmails = new Set<string>(['existing@example.com']);

  async login(identifier: string, password: string): Promise<LoginResult> {
    console.log('Mock Login:', identifier, password);

    // Simulate Gateway Errors for testing
    if (identifier.includes('invalid') || password === 'wrong') {
      throw new GatewayApiError(
        'INVALID_CREDENTIALS',
        'Invalid email address or password.',
        401,
        'corr-login-401'
      );
    }

    if (identifier.includes('validation')) {
      throw new GatewayApiError(
        'VALIDATION_FAILED',
        'Login form validation failed.',
        422,
        'corr-val-422',
        {
          email: 'Enter a valid email address format',
          password: 'Password must contain at least one uppercase letter',
        }
      );
    }

    await new Promise((res) => setTimeout(res, 300));

    return {
      accessToken: 'mock-access-token',
      user: {
        id: 'mock-user-id',
        email: identifier,
        displayName: identifier.split('@')[0] || identifier,
        roles: ['gamer'],
      },
    };
  }

  async register(input: RegisterInput): Promise<void> {
    console.log('Mock Register:', input.displayName, input.email, input.password);
    const normalizedEmail = input.email.toLowerCase().trim();

    if (this.registeredEmails.has(normalizedEmail) || normalizedEmail.includes('existing')) {
      throw new GatewayApiError(
        'EMAIL_ALREADY_EXISTS',
        'An account with this email address already exists.',
        409,
        'corr-reg-409',
        { email: 'An account with this email address already exists.' }
      );
    }

    if (normalizedEmail.includes('validation') || input.password.length < 6) {
      throw new GatewayApiError(
        'VALIDATION_FAILED',
        'Validation failed for registration input.',
        422,
        'corr-reg-422',
        {
          displayName: 'Display name must be at least 3 characters',
          password: 'Password must be at least 12 characters long',
        }
      );
    }

    this.registeredEmails.add(normalizedEmail);
    await new Promise((res) => setTimeout(res, 300));
  }

  async refresh(): Promise<LoginResult> {
    await Promise.resolve();
    throw new GatewayApiError(
      'UNAUTHENTICATED',
      'Session expired or refresh token invalid',
      401,
      'corr-ref-401'
    );
  }

  async logout(): Promise<void> {
    await Promise.resolve();
  }
}
