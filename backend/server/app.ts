import express from 'express';
import cors from 'cors';

const app = express();

app.use(cors());
app.use(express.json());

import authRouter from './auth';
import kitRouter from './kits';
import practiceRouter from './practice';

// Basic health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.use('/api/auth', authRouter);
app.use('/api/kits', kitRouter);
app.use('/api/kits', practiceRouter);

export { app };
