import { redirect } from '@tanstack/react-router';
import type { AuthContextValue } from '../context/AuthContext';

/**
 * Auth Guard: Requires user to be authenticated.
 * If status is anything except 'authenticated', redirects to /login.
 */
export function requireAuth(auth: AuthContextValue, locationHref?: string) {
  if (auth.status === 'loading' || auth.status === 'idle') {
    return;
  }

  if (auth.status !== 'authenticated' || !auth.isAuthenticated) {
    throw redirect({
      to: '/login',
      search: locationHref ? { redirect: locationHref } : undefined,
    });
  }
}

/**
 * Admin Guard: Strictly requires the user to be authenticated AND have the 'admin' role.
 * - If not authenticated: redirects to /login with redirect URL.
 * - If authenticated as a non-admin: strictly redirects to landing page '/'.
 */
export function requireAdmin(auth: AuthContextValue, locationHref?: string) {
  if (auth.status === 'loading' || auth.status === 'idle') {
    return;
  }

  if (auth.status !== 'authenticated' || !auth.isAuthenticated || !auth.user) {
    throw redirect({
      to: '/login',
      search: locationHref ? { redirect: locationHref } : undefined,
    });
  }

  const roles = auth.user.roles || [];
  const isAdmin = Array.isArray(roles) && roles.includes('admin');

  if (!isAdmin) {
    throw redirect({
      to: '/',
    });
  }
}

/**
 * Creator Guard: Strictly requires the user to be authenticated AND have the 'creator' (or 'admin') role.
 * - If not authenticated: redirects to /login with redirect URL.
 * - If authenticated as a non-creator: strictly redirects to landing page '/'.
 */
export function requireCreator(auth: AuthContextValue, locationHref?: string) {
  if (auth.status === 'loading' || auth.status === 'idle') {
    return;
  }

  if (auth.status !== 'authenticated' || !auth.isAuthenticated || !auth.user) {
    throw redirect({
      to: '/login',
      search: locationHref ? { redirect: locationHref } : undefined,
    });
  }

  const roles = auth.user.roles || [];
  const isCreator = Array.isArray(roles) && (roles.includes('creator') || roles.includes('admin'));

  if (!isCreator) {
    throw redirect({
      to: '/',
    });
  }
}

/**
 * Guest Guard: Requires user to be unauthenticated/guest.
 * If user is already authenticated:
 * - Admins redirect to '/admin'
 * - Creators redirect to '/creator'
 * - Normal users redirect to landing page '/'
 */
export function requireGuest(auth: AuthContextValue) {
  if (auth.status === 'authenticated' && auth.isAuthenticated && auth.user) {
    const roles = auth.user.roles || [];
    const isAdmin = Array.isArray(roles) && roles.includes('admin');
    const isCreator = Array.isArray(roles) && roles.includes('creator');
    throw redirect({
      to: isAdmin ? '/admin' : isCreator ? '/creator' : '/',
    });
  }
}
