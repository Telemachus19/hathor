import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    include: ['tests/**/*.test.ts'],
    environment: 'node',
    env: {
      AUTH_DB_URL: 'postgresql://auth_app:auth_app_secret_dev@127.0.0.1:5432/auth',
      CATALOG_DB_URL: 'postgresql://catalog_app:catalog_app_secret_dev@127.0.0.1:5432/catalog',
      COMMERCE_DB_URL: 'postgresql://commerce_app:commerce_app_secret_dev@127.0.0.1:5432/commerce',
      LIBRARY_DB_URL: 'postgresql://library_app:library_app_secret_dev@127.0.0.1:5432/library',
    },
    restoreMocks: true,
  },
});
