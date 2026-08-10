import { createFileRoute } from '@tanstack/react-router';
import { requireAuth } from '../utils/authGuard';
import LibraryPage from './library-page';

export const Route = createFileRoute('/library')({
  beforeLoad: ({ context, location }) => {
    requireAuth(context.auth, location.href);
  },
  component: LibraryPage,
});

