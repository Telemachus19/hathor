import * as dotenv from 'dotenv';
import { createCatalogApp } from './app.js';
import { catalogPool } from './infrastructure/db/client.js';
import { seedCatalog } from './infrastructure/db/seed.js';
export { validateThemeAgainstDocument } from './utils/themeValidator.js';

dotenv.config();

const PORT = process.env.PORT || 5002;
const app = createCatalogApp(async () => {
  await catalogPool.query('SELECT 1');
});

async function start() {
  try {
    await seedCatalog();
  } catch (err) {
    console.error('Catalog auto-seed warning:', err);
  }

  app.listen(Number(PORT), '0.0.0.0', () => {
    console.log(`Hathor Catalog Service running on port ${PORT}`);
  });
}

void start();

process.on('SIGTERM', () => {
  void catalogPool.end().finally(() => process.exit(0));
});
