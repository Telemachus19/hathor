import * as dotenv from 'dotenv';
import { createAuthApp } from './app.js';
import { authPool } from './infrastructure/db/client.js';

dotenv.config();

const PORT = process.env.PORT || 5001;
const app = createAuthApp(async () => {
  await authPool.query('SELECT 1');
});

app.listen(PORT, () => {
  console.log(`Hathor Auth Service running on port ${PORT}`);
});

process.on('SIGTERM', () => {
  void authPool.end().finally(() => process.exit(0));
});
