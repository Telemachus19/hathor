import * as dotenv from 'dotenv';
import { createCommerceApp } from './app.js';
import { commercePool } from './infrastructure/db/client.js';
import { checkRabbitMq } from './infrastructure/rabbitmq-health.js';
import { OutboxPublisher } from './infrastructure/outbox/outbox-publisher.js';
import { OutboxWorker } from './infrastructure/outbox/outbox-worker.js';
import { startQueueConsumer } from './infrastructure/queue-consumer.js';
import { runMigrations } from './infrastructure/db/migrate.js';

dotenv.config();

const PORT = process.env.PORT || 5003;
const RABBITMQ_URL = process.env.RABBITMQ_URL;

if (!RABBITMQ_URL) {
  throw new Error('RABBITMQ_URL is required');
}

const outboxPublisher = new OutboxPublisher(RABBITMQ_URL);
const outboxWorker = new OutboxWorker(outboxPublisher, {
  pollIntervalMs: 1000,
  batchSize: 50,
  maxRetries: 5,
});

const app = createCommerceApp(async () => {
  await Promise.all([commercePool.query('SELECT 1'), checkRabbitMq(RABBITMQ_URL)]);
});

app.listen(PORT, () => {
  console.log(`Hathor Commerce Service running on port ${PORT}`);
  outboxWorker.start();
  startQueueConsumer(RABBITMQ_URL).catch((err) => {
    console.error('Failed to start RabbitMQ consumer:', err);
    process.exit(1);
  });
});

const gracefulShutdown = () => {
  console.log('[CommerceService] Shutting down outbox worker and database connections...');
  outboxWorker.stop();
  void outboxPublisher.close().finally(() => {
    void commercePool.end().finally(() => process.exit(0));
  });
};

process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);
