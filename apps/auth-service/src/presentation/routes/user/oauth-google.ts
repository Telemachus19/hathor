import { Request, Response } from 'express';
import { randomBytes } from 'node:crypto';

export async function googleOAuthRedirectHandler(_req: Request, res: Response) {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const callbackUrl = process.env.GOOGLE_CALLBACK_URL || 'http://localhost:5000/api/v1/user/oauth/google/callback';

  if (!clientId) {
    return res.status(503).json({
      success: false,
      error: {
        code: 'OAUTH_NOT_CONFIGURED',
        message: 'Google OAuth 2.0 is not configured on this server. Missing GOOGLE_CLIENT_ID.',
      },
    });
  }

  // 1. Generate CSRF state token
  const state = randomBytes(32).toString('hex');

  // 2. Set HttpOnly, SameSite=Lax cookie for state verification
  const isProd = process.env.NODE_ENV === 'production';
  res.cookie('oauth_state', state, {
    httpOnly: true,
    secure: isProd,
    sameSite: 'lax',
    path: '/api/v1/user/oauth/google/callback',
    maxAge: 10 * 60 * 1000, // 10 minutes
  });

  // 3. Construct Google authorization URL
  const googleAuthUrl =
    `https://accounts.google.com/o/oauth2/v2/auth?` +
    `client_id=${encodeURIComponent(clientId)}` +
    `&redirect_uri=${encodeURIComponent(callbackUrl)}` +
    `&response_type=code` +
    `&scope=${encodeURIComponent('openid profile email')}` +
    `&state=${encodeURIComponent(state)}` +
    `&prompt=select_account`;

  return res.redirect(googleAuthUrl);
}
