import { useEffect } from 'react';
import { createFileRoute, useNavigate, useSearch } from '@tanstack/react-router';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

export const Route = createFileRoute('/oauth/callback')({
  validateSearch: (search: Record<string, unknown>) => ({
    status: typeof search.status === 'string' ? search.status : '',
    error: typeof search.error === 'string' ? search.error : '',
  }),
  component: OAuthCallbackPage,
});

function OAuthCallbackPage() {
  const { status, error } = useSearch({ from: '/oauth/callback' });
  const { refresh } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    let isMounted = true;

    async function handleOAuthCompletion() {
      if (status === 'success') {
        try {
          // Recover memory-only access token using boot refresh from HttpOnly cookie
          await refresh();
          if (isMounted) {
            showToast('success', 'Signed in with Google Account successfully!');
            navigate({ to: '/' });
          }
        } catch {
          if (isMounted) {
            showToast('error', 'Failed to recover authenticated session. Please try logging in again.');
            navigate({ to: '/login' });
          }
        }
      } else {
        if (isMounted) {
          const errorMessage =
            error === 'ACCOUNT_DISABLED'
              ? 'This account has been disabled.'
              : error === 'OAUTH_CANCELLED'
              ? 'Google sign-in was cancelled.'
              : 'Google Single Sign-On failed. Please try again or sign in with password.';

          showToast('error', errorMessage);
          navigate({ to: '/login' });
        }
      }
    }

    handleOAuthCompletion();

    return () => {
      isMounted = false;
    };
  }, [status, error, refresh, showToast, navigate]);

  return (
    <main style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ textAlign: 'center', color: '#f3f4f6' }}>
        <h2 style={{ color: '#d97706', marginBottom: '12px' }}>Completing Authentication...</h2>
        <p style={{ color: '#9ca3af' }}>Please wait while we verify your session.</p>
      </div>
    </main>
  );
}
