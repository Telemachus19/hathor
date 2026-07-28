import { redirect } from '@tanstack/react-router';
import type { AuthContextValue } from '../context/AuthContext';

/**
 * Auth Guard: Requires user to be authenticated.
 * If status is anything except 'authenticated', redirects to /login.
 */
export function requireAuth(auth: AuthContextValue, locationHref?: string) {
  if (auth.status !== 'authenticated' || !auth.isAuthenticated) {
    throw redirect({
      to: '/login',
      search: locationHref ? { redirect: locationHref } : undefined,
    });
  }
}

/**
 * Guest Guard: Requires user to be unauthenticated/guest.
 * If user is already authenticated, redirects to home '/'.
 */
export function requireGuest(auth: AuthContextValue) {
  if (auth.status === 'authenticated' && auth.isAuthenticated) {
    throw redirect({
      to: '/',
    });
  }
}
