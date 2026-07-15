import express, { Request, Response } from 'express';
import cors from 'cors';
import * as dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5001;

app.use(cors());
app.use(express.json());

app.get('/health', (req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    data: {
      service: 'auth-service (User Authentication & RS256 Token Signer)',
      status: 'healthy',
      timestamp: new Date().toISOString(),
    },
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Hathor Auth Service running on port ${PORT}`);
});
