// lib/mongodb.ts
import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI!;

if (!MONGODB_URI) {
  throw new Error('Please define the MONGODB_URI environment variable');
}

interface MongooseCache {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

declare global {
  var mongoose: MongooseCache | undefined;
}

let cached: MongooseCache = global.mongoose || { conn: null, promise: null };

if (!global.mongoose) {
  global.mongoose = cached;
}

export async function connectDB(): Promise<typeof mongoose> {
  if (cached.conn) {
    console.log('📦 Using cached MongoDB connection');
    return cached.conn;
  }

  if (!cached.promise) {
    console.log('🔗 Creating new MongoDB connection promise');
    console.log('🌍 Environment:', process.env.NODE_ENV);
    console.log('🔗 MongoDB URI exists:', !!MONGODB_URI);
    
    const opts = {
      bufferCommands: false,
      maxPoolSize: 10, // Maintain up to 10 socket connections
      serverSelectionTimeoutMS: 5000, // Keep trying to send operations for 5 seconds
      socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
      maxIdleTimeMS: 30000, // Close connections after 30 seconds of inactivity
    };

    cached.promise = mongoose.connect(MONGODB_URI, opts);
  }

  try {
    console.log('🔗 Attempting MongoDB connection...');
    cached.conn = await cached.promise;
    console.log('✅ MongoDB connected successfully');
    console.log('📊 Connection state:', mongoose.connection.readyState);
    return cached.conn;
  } catch (error) {
    cached.promise = null;
    console.error('❌ MongoDB connection error:', error);
    console.error('❌ Error details:', {
      name: error instanceof Error ? error.name : 'Unknown',
      message: error instanceof Error ? error.message : 'Unknown error',
      code: (error as any)?.code,
      codeName: (error as any)?.codeName
    });
    
    // Provide more specific error guidance
    if (error instanceof Error && error.message.includes('IP')) {
      console.error('🔒 IP Whitelist Issue: Your current IP address might not be whitelisted in MongoDB Atlas');
      console.error('📍 Your current IP appears to be different from what\'s allowed in Atlas');
      console.error('🔧 Solution: Add your IP address to the Atlas whitelist or allow access from anywhere (0.0.0.0/0) for development');
    }
    
    if (error instanceof Error && error.message.includes('authentication')) {
      console.error('🔐 Authentication Issue: Check your MongoDB credentials');
      console.error('🔧 Solution: Verify MONGODB_URI has correct username/password');
    }
    
    if (error instanceof Error && error.message.includes('timeout')) {
      console.error('⏱️ Timeout Issue: Connection to MongoDB timed out');
      console.error('🔧 Solution: Check network connectivity or increase timeout values');
    }
    
    throw error;
  }
}