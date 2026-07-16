import express, { Request, Response } from 'express';
import cors from 'cors';
import * as dotenv from 'dotenv';
import { commercePool } from './infrastructure/db/client.js';
import { checkRabbitMq } from './infrastructure/rabbitmq-health.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5003;
const RABBITMQ_URL = process.env.RABBITMQ_URL;

if (!RABBITMQ_URL) {
  throw new Error('RABBITMQ_URL is required');
}

app.use(cors());
app.use(express.json());

app.get('/health/live', (_req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    data: {
      service: 'commerce-service',
      status: 'live',
      timestamp: new Date().toISOString(),
    },
  });
});

app.get('/health/ready', async (_req: Request, res: Response) => {
  try {
    await Promise.all([commercePool.query('SELECT 1'), checkRabbitMq(RABBITMQ_URL)]);
    res.status(200).json({
      success: true,
      data: {
        service: 'commerce-service',
        status: 'ready',
        timestamp: new Date().toISOString(),
        checks: { database: 'up', rabbitmq: 'up' },
      },
    });
  } catch {
    res.status(503).json({
      success: false,
      error: { code: 'SERVICE_NOT_READY', message: 'Commerce service is not ready' },
    });
  }
});

app.listen(PORT, () => {
  console.log(`Hathor Commerce Service running on port ${PORT}`);
});

process.on('SIGTERM', () => {
  void commercePool.end().finally(() => process.exit(0));
});
