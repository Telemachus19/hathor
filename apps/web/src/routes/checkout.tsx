import { createFileRoute } from '@tanstack/react-router';
import { requireAuth } from '../utils/authGuard';
import CheckoutPage from './checkout-page/CheckoutPage';

export const Route = createFileRoute('/checkout')({
  beforeLoad: ({ context, location }) => {
    requireAuth(context.auth, location.href);
  },
  component: CheckoutPage,
});
