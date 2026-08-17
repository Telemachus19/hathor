import * as dotenv from 'dotenv';
import { createGatewayApp } from './app.js';

dotenv.config();

const PORT = process.env.PORT || 5000;
const app = createGatewayApp();

app.listen(Number(PORT), '0.0.0.0', () => {
  console.log(`Hathor API Gateway running on http://localhost:${PORT}/api/v1`);
});
