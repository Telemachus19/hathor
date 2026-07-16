import express, { Request, Response } from 'express';
import cors from 'cors';
import * as dotenv from 'dotenv';
import { catalogPool } from './infrastructure/db/client.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5002;

app.use(cors());
app.use(express.json());

app.get('/health/live', (_req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    data: {
      service: 'catalog-service',
      status: 'live',
      timestamp: new Date().toISOString(),
    },
  });
});

app.get('/health/ready', async (_req: Request, res: Response) => {
  try {
    await catalogPool.query('SELECT 1');
    res.status(200).json({
      success: true,
      data: {
        service: 'catalog-service',
        status: 'ready',
        timestamp: new Date().toISOString(),
        checks: { database: 'up' },
      },
    });
  } catch {
    res.status(503).json({
      success: false,
      error: { code: 'SERVICE_NOT_READY', message: 'Catalog service is not ready' },
    });
  }
});

app.listen(PORT, () => {
  console.log(`Hathor Catalog Service running on port ${PORT}`);
});

process.on('SIGTERM', () => {
  void catalogPool.end().finally(() => process.exit(0));
});
