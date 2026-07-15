import express, { Request, Response, Router } from 'express';
import cors from 'cors';
import proxy from 'express-http-proxy';
import * as dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

const AUTH_SERVICE_URL = process.env.AUTH_SERVICE_URL || 'http://localhost:5001';
const CATALOG_SERVICE_URL = process.env.CATALOG_SERVICE_URL || 'http://localhost:5002';
const COMMERCE_SERVICE_URL = process.env.COMMERCE_SERVICE_URL || 'http://localhost:5003';
const LIBRARY_SERVICE_URL = process.env.LIBRARY_SERVICE_URL || 'http://localhost:5004';

app.use(cors());
app.use(express.json());

const apiV1Router: Router = express.Router();

// Central Health Check Endpoint
apiV1Router.get('/health', (req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    data: {
      status: 'healthy',
      service: 'api-gateway',
      timestamp: new Date().toISOString(),
      routes: {
        auth: AUTH_SERVICE_URL,
        catalog: CATALOG_SERVICE_URL,
        commerce: COMMERCE_SERVICE_URL,
        library: LIBRARY_SERVICE_URL,
      },
    },
  });
});

// Proxy Microservice Routes
apiV1Router.use('/auth', proxy(AUTH_SERVICE_URL));
apiV1Router.use('/store', proxy(CATALOG_SERVICE_URL));
apiV1Router.use('/txn', proxy(COMMERCE_SERVICE_URL));
apiV1Router.use('/library', proxy(LIBRARY_SERVICE_URL));

app.use('/api/v1', apiV1Router);

app.listen(PORT, () => {
  console.log(`🚀 Hathor API Gateway running on http://localhost:${PORT}/api/v1`);
});
