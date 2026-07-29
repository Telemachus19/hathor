import { createRouter } from '@tanstack/react-router';
import { routeTree } from './routeTree.gen.js';

/**
 * TanStack Router instance.
 */
export const router = createRouter({
  routeTree,
  defaultPreload: 'intent',
  context: {
    auth: undefined!,
  },
});

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}
