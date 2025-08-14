// app/api/debug/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '../../../lib/mongodb';
import mongoose from 'mongoose';

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 Debug endpoint called');
    console.log('🌍 Environment:', process.env.NODE_ENV);
    console.log('🔗 MongoDB URI exists:', !!process.env.MONGODB_URI);
    console.log('🔐 NextAuth Secret exists:', !!process.env.NEXTAUTH_SECRET);
    console.log('🔗 NextAuth URL:', process.env.NEXTAUTH_URL);
    
    // Test database connection
    try {
      await connectDB();
      const connectionState = mongoose.connection.readyState;
      const stateNames = {
        0: 'disconnected',
        1: 'connected',
        2: 'connecting',
        3: 'disconnecting'
      };
      
      return NextResponse.json({
        status: 'success',
        environment: process.env.NODE_ENV,
        database: {
          connected: connectionState === 1,
          state: stateNames[connectionState as keyof typeof stateNames] || 'unknown',
          readyState: connectionState
        },
        env_vars: {
          mongodb_uri_set: !!process.env.MONGODB_URI,
          nextauth_secret_set: !!process.env.NEXTAUTH_SECRET,
          nextauth_url: process.env.NEXTAUTH_URL,
          google_client_id_set: !!process.env.GOOGLE_CLIENT_ID,
          google_client_secret_set: !!process.env.GOOGLE_CLIENT_SECRET,
        },
        timestamp: new Date().toISOString()
      });
    } catch (dbError) {
      console.error('❌ Database connection failed in debug:', dbError);
      return NextResponse.json({
        status: 'error',
        error: 'Database connection failed',
        details: dbError instanceof Error ? dbError.message : String(dbError),
        environment: process.env.NODE_ENV,
        env_vars: {
          mongodb_uri_set: !!process.env.MONGODB_URI,
          nextauth_secret_set: !!process.env.NEXTAUTH_SECRET,
          nextauth_url: process.env.NEXTAUTH_URL,
        }
      }, { status: 500 });
    }
  } catch (error) {
    console.error('❌ Debug endpoint error:', error);
    return NextResponse.json({
      status: 'error',
      error: 'Debug endpoint failed',
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
}
