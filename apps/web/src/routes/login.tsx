import { createFileRoute } from '@tanstack/react-router';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

export const Route = createFileRoute('/login')({
  component: LoginPage,
});

function LoginPage() {
  const { login, user, accessToken, isAuthenticated } =
    useAuth();

  const { showToast } = useToast();

  async function handleLogin() {
    await login('test@example.com', 'password');

    showToast('success', 'Login successful!');
  }

  return (
    <main>
      <h1>Login</h1>

      <button type="button" onClick={handleLogin}>
        Test Login
      </button>

      <p>
        Authenticated: {isAuthenticated ? 'Yes' : 'No'}
      </p>

      <p>
        User: {user?.username ?? 'None'}
      </p>

      <p>
        Token: {accessToken ?? 'None'}
      </p>
    </main>
  );
}