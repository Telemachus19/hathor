import * as dotenv from 'dotenv';
import { createGatewayApp } from './app.js';

dotenv.config();

const PORT = process.env.PORT || 5000;
const app = createGatewayApp();
const serverTimeoutMs = Number(process.env.PROXY_TIMEOUT_MS) || 120_000;

const server = app.listen(Number(PORT), '0.0.0.0', () => {
  console.log(`Hathor API Gateway running on http://localhost:${PORT}/api/v1`);
});

server.setTimeout(serverTimeoutMs + 10_000);
server.headersTimeout = serverTimeoutMs + 15_000;
server.keepAliveTimeout = serverTimeoutMs + 10_000;
