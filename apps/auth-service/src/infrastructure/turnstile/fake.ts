import { TurnstileVerifier } from '../../domain/turnstile.js';

export class FakeTurnstileVerifier implements TurnstileVerifier {
  constructor(private readonly defaultSuccess: boolean = true) {}

  async verify(token: string, _remoteIp?: string): Promise<boolean> {
    if (!token) {
      return false;
    }

    if (token === 'fail-token' || token === 'invalid-token') {
      return false;
    }

    return this.defaultSuccess;
  }
}
