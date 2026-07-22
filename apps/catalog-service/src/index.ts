import * as dotenv from 'dotenv';
import { createCatalogApp } from './app.js';
import { catalogPool } from './infrastructure/db/client.js';

dotenv.config();

const PORT = process.env.PORT || 5002;
const app = createCatalogApp(async () => {
  await catalogPool.query('SELECT 1');
});

app.listen(PORT, () => {
  console.log(`Hathor Catalog Service running on port ${PORT}`);
});

process.on('SIGTERM', () => {
  void catalogPool.end().finally(() => process.exit(0));
});
