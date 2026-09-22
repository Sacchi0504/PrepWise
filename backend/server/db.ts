import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';

let mongod: MongoMemoryServer;

export async function connectDB() {
  let uri = process.env.MONGODB_URI || process.env.MONGO_URI;

  try {
    // If no URI is provided, or it is local, use the memory server
    if (!uri || uri.includes('127.0.0.1') || uri.includes('localhost')) {
      mongod = await MongoMemoryServer.create();
      uri = mongod.getUri();
      console.log(`Using In-Memory MongoDB as fallback`);
    }

    const conn = await mongoose.connect(uri);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
}
