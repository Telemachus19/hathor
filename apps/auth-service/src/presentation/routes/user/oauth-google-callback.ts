import { Request, Response } from 'express';
import { randomBytes, createHash } from 'node:crypto';
import { eq, and } from 'drizzle-orm';
import { authDb } from '../../../infrastructure/db/client.js';
import { users, userOauthProviders, refreshTokenFamilies, refreshTokens } from '../../../infrastructure/db/schema.js';
import { generateAccessToken } from '../../../domain/token.js';

export async function googleOAuthCallbackHandler(req: Request, res: Response) {
  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const callbackUrl = process.env.GOOGLE_CALLBACK_URL || 'http://localhost:5000/api/v1/user/oauth/google/callback';

  const { code, state, error: googleError } = req.query;
  const savedState = req.cookies?.oauth_state;

  // Clear state cookie
  res.clearCookie('oauth_state', {
    path: '/',
  });

  if (googleError || !code || typeof code !== 'string') {
    return res.redirect(`${frontendUrl}/login?error=OAUTH_CANCELLED`);
  }

  // 1. CSRF State Verification
  if (!state || typeof state !== 'string' || !savedState || state !== savedState) {
    return res.redirect(`${frontendUrl}/login?error=OAUTH_STATE_INVALID`);
  }

  if (!clientId || !clientSecret) {
    return res.redirect(`${frontendUrl}/login?error=OAUTH_NOT_CONFIGURED`);
  }

  try {
    // 2. Exchange authorization code for Google access token
    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: callbackUrl,
        grant_type: 'authorization_code',
      }),
    });

    if (!tokenResponse.ok) {
      console.error('Google OAuth token exchange failed:', await tokenResponse.text());
      return res.redirect(`${frontendUrl}/login?error=OAUTH_TOKEN_EXCHANGE_FAILED`);
    }

    const tokenData = (await tokenResponse.json()) as { access_token?: string };
    if (!tokenData.access_token) {
      return res.redirect(`${frontendUrl}/login?error=OAUTH_TOKEN_EXCHANGE_FAILED`);
    }

    // 3. Fetch Google User Profile using Access Token
    const userResponse = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
      headers: {
        Authorization: `Bearer ${tokenData.access_token}`,
      },
    });

    if (!userResponse.ok) {
      return res.redirect(`${frontendUrl}/login?error=OAUTH_USER_FETCH_FAILED`);
    }

    const googleUser = (await userResponse.json()) as {
      sub?: string;
      email?: string;
      name?: string;
    };

    if (!googleUser.sub || !googleUser.email) {
      return res.redirect(`${frontendUrl}/login?error=OAUTH_INVALID_USER_DATA`);
    }

    const googleSub = googleUser.sub;
    const googleEmail = googleUser.email.toLowerCase();
    const displayName = googleUser.name || googleEmail.split('@')[0] || 'Gamer';

    // 4. Identity Resolution via user_oauth_providers (Stable Google sub ID)
    let targetUserId: string | null = null;

    const [existingOauthRecord] = await authDb
      .select()
      .from(userOauthProviders)
      .where(
        and(
          eq(userOauthProviders.provider, 'google'),
          eq(userOauthProviders.providerUserId, googleSub)
        )
      )
      .limit(1);

    if (existingOauthRecord) {
      targetUserId = existingOauthRecord.userId;
    } else {
      // Create new user & link provider record
      await authDb.transaction(async (tx) => {
        const [newUser] = await tx
          .insert(users)
          .values({
            email: googleEmail,
            passwordHash: null, // No password for Google OAuth users
            displayName,
            roles: ['gamer'],
          })
          .returning();

        await tx.insert(userOauthProviders).values({
          userId: newUser.id,
          provider: 'google',
          providerUserId: googleSub,
          email: googleEmail,
        });

        targetUserId = newUser.id;
      });
    }

    // 5. Verify User Account
    const [user] = await authDb
      .select()
      .from(users)
      .where(eq(users.id, targetUserId!))
      .limit(1);

    if (!user || user.disabled) {
      return res.redirect(`${frontendUrl}/login?error=ACCOUNT_DISABLED`);
    }

    // 6. Issue Access Token & Refresh Token Family
    const accessToken = generateAccessToken({
      id: user.id,
      roles: user.roles,
      authorizationVersion: user.authorizationVersion,
    });

    const rawRefreshToken = randomBytes(40).toString('hex');
    const tokenHash = createHash('sha256').update(rawRefreshToken).digest('hex');

    await authDb.transaction(async (tx) => {
      const [family] = await tx
        .insert(refreshTokenFamilies)
        .values({
          userId: user.id,
        })
        .returning();

      await tx.insert(refreshTokens).values({
        userId: user.id,
        familyId: family.id,
        tokenHash,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
      });
    });

    // 7. Set HttpOnly Cookie
    const isSecure =
      process.env.COOKIE_SECURE !== undefined
        ? process.env.COOKIE_SECURE === 'true'
        : process.env.NODE_ENV === 'production' || process.env.NODE_ENV === 'test';

    res.cookie('refreshToken', rawRefreshToken, {
      httpOnly: true,
      secure: isSecure,
      sameSite: 'lax',
      path: '/api/v1/user',
      expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    });

    // 8. Redirect safely to frontend callback route
    return res.redirect(`${frontendUrl}/oauth/callback?status=success`);
  } catch (error) {
    console.error('Google OAuth callback error:', error);
    return res.redirect(`${frontendUrl}/login?error=OAUTH_INTERNAL_ERROR`);
  }
}
