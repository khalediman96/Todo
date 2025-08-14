// app/api/debug/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '../../../lib/mongodb';
import { getToken } from 'next-auth/jwt';
import { Todo } from '../../../lib/models/Todo';
import mongoose from 'mongoose';

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 Debug endpoint called');
    console.log('🌍 Environment:', process.env.NODE_ENV);
    console.log('🔗 MongoDB URI exists:', !!process.env.MONGODB_URI);
    console.log('🔐 NextAuth Secret exists:', !!process.env.NEXTAUTH_SECRET);
    console.log('🔗 NextAuth URL:', process.env.NEXTAUTH_URL);
    
    // Test authentication
    const token = await getToken({
      req: request,
      secret: process.env.NEXTAUTH_SECRET,
    });

    console.log('🔐 Token check:', {
      exists: !!token,
      hasId: !!(token?.id),
      email: token?.email
    });
    
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

      // If user is authenticated, try to fetch their todos
      let todoInfo = null;
      if (token?.id) {
        try {
          const todoCount = await Todo.countDocuments({ userId: token.id });
          const sampleTodos = await Todo.find({ userId: token.id }).limit(3).lean();
          todoInfo = {
            count: todoCount,
            sampleTitles: sampleTodos.map(t => t.title)
          };
        } catch (todoError) {
          console.error('❌ Error fetching todos in debug:', todoError);
          todoInfo = { error: 'Failed to fetch todos' };
        }
      }
      
      return NextResponse.json({
        status: 'success',
        environment: process.env.NODE_ENV,
        authentication: {
          tokenExists: !!token,
          hasUserId: !!(token?.id),
          userEmail: token?.email
        },
        database: {
          connected: connectionState === 1,
          state: stateNames[connectionState as keyof typeof stateNames] || 'unknown',
          readyState: connectionState
        },
        todos: todoInfo,
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
