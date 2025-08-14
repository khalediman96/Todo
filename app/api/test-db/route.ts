// app/api/test-db/route.ts
import { NextResponse } from 'next/server';
import { connectDB } from '../../../lib/mongodb';
import mongoose from 'mongoose';

export async function GET() {
  try {
    console.log('🔗 Testing MongoDB connection...');
    console.log('🌍 Environment:', process.env.NODE_ENV);
    console.log('🔗 MongoDB URI exists:', !!process.env.MONGODB_URI);
    console.log('🔗 MongoDB URI preview:', process.env.MONGODB_URI?.substring(0, 50) + '...');
    
    // Test connection with detailed logging
    await connectDB();
    
    const connectionState = mongoose.connection.readyState;
    const stateNames: { [key: number]: string } = {
      0: 'disconnected',
      1: 'connected',
      2: 'connecting',
      3: 'disconnecting'
    };

    return NextResponse.json({
      status: 'success',
      database: {
        connected: connectionState === 1,
        state: stateNames[connectionState] || 'unknown',
        stateCode: connectionState,
        host: mongoose.connection.host,
        name: mongoose.connection.name,
      },
      environment: process.env.NODE_ENV,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('❌ Database connection error:', error);
    
    // More detailed error information
    const errorInfo = {
      name: error instanceof Error ? error.name : 'Unknown',
      message: error instanceof Error ? error.message : 'Unknown error',
      code: (error as any)?.code,
      codeName: (error as any)?.codeName,
    };

    // Check for common issues
    let troubleshooting = '';
    if (errorInfo.message?.includes('IP')) {
      troubleshooting = 'IP_WHITELIST_ISSUE: Add 0.0.0.0/0 to MongoDB Atlas Network Access';
    } else if (errorInfo.message?.includes('authentication')) {
      troubleshooting = 'AUTH_ISSUE: Check MongoDB credentials';
    } else if (errorInfo.message?.includes('timeout')) {
      troubleshooting = 'TIMEOUT_ISSUE: Check network connectivity';
    }
    
    return NextResponse.json({
      status: 'error',
      error: errorInfo,
      troubleshooting,
      environment: process.env.NODE_ENV,
      hasMongoUri: !!process.env.MONGODB_URI,
      timestamp: new Date().toISOString(),
    }, { status: 500 });
  }
}
