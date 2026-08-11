import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { TanStackRouterVite } from '@tanstack/router-plugin/vite';

export default defineConfig({
  plugins: [
    TanStackRouterVite({
      routesDirectory: './src/routes',
      generatedRouteTree: './src/routeTree.gen.ts',
      routeFileIgnorePattern:
        '((components|assets|data|utils|types|ui|inspector|modals|sidebar|controls|canvas)/.*|.*Data\\.ts|.*Cache\\.ts|.*\\.d\\.ts)',
    }),
    react(),
  ],
  server: {
    port: 3000,
  },
});
