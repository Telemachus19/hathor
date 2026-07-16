import * as dotenv from 'dotenv';
import { createCommerceApp } from './app.js';
import { commercePool } from './infrastructure/db/client.js';
import { checkRabbitMq } from './infrastructure/rabbitmq-health.js';

dotenv.config();

const PORT = process.env.PORT || 5003;
const RABBITMQ_URL = process.env.RABBITMQ_URL;

if (!RABBITMQ_URL) {
  throw new Error('RABBITMQ_URL is required');
}

const app = createCommerceApp(async () => {
  await Promise.all([commercePool.query('SELECT 1'), checkRabbitMq(RABBITMQ_URL)]);
});

app.listen(PORT, () => {
  console.log(`Hathor Commerce Service running on port ${PORT}`);
});

process.on('SIGTERM', () => {
  void commercePool.end().finally(() => process.exit(0));
});
