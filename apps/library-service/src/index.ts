import * as dotenv from 'dotenv';
import { createLibraryApp } from './app.js';
import { libraryPool } from './infrastructure/db/client.js';
import { checkRabbitMq } from './infrastructure/rabbitmq-health.js';
import { startQueueConsumer } from './infrastructure/queue-consumer.js';

dotenv.config();

const PORT = process.env.PORT || 5004;
const RABBITMQ_URL = process.env.RABBITMQ_URL;

if (!RABBITMQ_URL) {
  throw new Error('RABBITMQ_URL is required');
}

const app = createLibraryApp(async () => {
  await Promise.all([libraryPool.query('SELECT 1'), checkRabbitMq(RABBITMQ_URL)]);
});

app.listen(PORT, () => {
  console.log(`Hathor Library Service running on port ${PORT}`);

  startQueueConsumer(RABBITMQ_URL).catch((err) => {
    console.error('Failed to start RabbitMQ consumer:', err);
    process.exit(1);
  });
});

process.on('SIGTERM', () => {
  void libraryPool.end().finally(() => process.exit(0));
});

