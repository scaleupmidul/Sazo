import mongoose from 'mongoose';
import 'dotenv/config';

/**
 * Global is used here to maintain a cached connection across hot reloads
 * in development. This is essential for serverless environments.
 */
let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

const connectDB = async () => {
  if (cached.conn) {
    // Use existing database connection
    return cached.conn;
  }

  if (!cached.promise) {
    if (!process.env.MONGO_URI) {
      throw new Error('MONGO_URI is not defined in environment variables.');
    }

    // Optimized options for serverless/Vercel environment
    const opts = {
      bufferCommands: false,
      maxPoolSize: 10, // Limit pool size for serverless
      serverSelectionTimeoutMS: 5000, // Fail fast if DB is unreachable
      socketTimeoutMS: 45000, // Close sockets after inactivity
    };
    
    cached.promise = mongoose.connect(process.env.MONGO_URI, opts).then((mongoose) => {
      console.log(`MongoDB Connected: ${mongoose.connection.host}`);
      return mongoose;
    }).catch(err => {
        console.error(`Error connecting to MongoDB: ${err.message}`);
        // Reset promise on error to allow retry
        cached.promise = null; 
        throw err;
    });
  }
  
  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    throw e;
  }
  
  return cached.conn;
};

export default connectDB;
