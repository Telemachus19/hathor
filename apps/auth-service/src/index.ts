import * as dotenv from 'dotenv';
import { createAuthApp } from './app.js';
import { authPool } from './infrastructure/db/client.js';
import { CloudflareTurnstileVerifier } from './infrastructure/turnstile/cloudflare.js';
import { FakeTurnstileVerifier } from './infrastructure/turnstile/fake.js';

dotenv.config();

const PORT = process.env.PORT || 5001;

const turnstileSecret = process.env.TURNSTILE_SECRET_KEY;
const turnstileVerifier = turnstileSecret
  ? new CloudflareTurnstileVerifier(turnstileSecret)
  : new FakeTurnstileVerifier();

const app = createAuthApp(async () => {
  await authPool.query('SELECT 1');
}, turnstileVerifier);

app.listen(PORT, () => {
  console.log(`Hathor Auth Service running on port ${PORT}`);
});

process.on('SIGTERM', () => {
  void authPool.end().finally(() => process.exit(0));
});
