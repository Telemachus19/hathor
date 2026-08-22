import { createFileRoute } from '@tanstack/react-router';
import { requireAuth } from '../utils/authGuard';
import ProfilePage from './profile-page';

export const Route = createFileRoute('/profile')({
  beforeLoad: ({ context, location }) => {
    requireAuth(context.auth, location.href);
  },
  component: ProfilePage,
});

