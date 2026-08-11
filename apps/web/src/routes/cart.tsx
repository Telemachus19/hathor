import { createFileRoute } from '@tanstack/react-router';
import CartPage from './cart-page/CartPage';

export const Route = createFileRoute('/cart')({
  component: CartPage,
});
