import dotenv from 'dotenv';
dotenv.config();

import { app } from './app';
import { connectDB } from './db';

const PORT = process.env.PORT || 8000;

async function startServer() {
  await connectDB();
  
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
}

startServer();
