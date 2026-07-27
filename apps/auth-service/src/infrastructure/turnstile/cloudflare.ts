import { TurnstileVerifier } from '../../domain/turnstile.js';

export class CloudflareTurnstileVerifier implements TurnstileVerifier {
  constructor(private readonly secretKey: string) {
    if (!secretKey) {
      throw new Error('Cloudflare Turnstile secret key is required');
    }
  }

  async verify(token: string, remoteIp?: string): Promise<boolean> {
    if (!token) {
      return false;
    }

    try {
      const response = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          secret: this.secretKey,
          response: token,
          remoteip: remoteIp,
        }),
      });

      if (!response.ok) {
        return false;
      }

      const data = (await response.json()) as { success: boolean; 'error-codes'?: string[] };
      return data.success;
    } catch (error) {
      console.error('Turnstile verification error:', error);
      return false;
    }
  }
}
