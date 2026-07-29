import { createRootRoute, Outlet } from '@tanstack/react-router';

/**
 * TanStack Router Root Route.
 * Serves as the top-level parent route rendering <Outlet /> for all child routes.
 */
export const rootRoute = createRootRoute({
  component: () => <Outlet />,
});
