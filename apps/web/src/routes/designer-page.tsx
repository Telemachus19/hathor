import { createFileRoute } from '@tanstack/react-router';
import DesignerPage from './designer-page/DesignerPage';
import { requireCreator } from '../utils/authGuard';

export const Route = createFileRoute('/designer-page')({
  beforeLoad: ({ context, location }) => {
    requireCreator(context.auth, location.href);
  },
  component: DesignerPage,
});
