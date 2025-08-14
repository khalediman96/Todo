// app/api/test-auth/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 Test Auth endpoint called');
    console.log('🌍 Environment:', process.env.NODE_ENV);
    console.log('🔗 Request URL:', request.url);
    console.log('🔐 NextAuth Secret exists:', !!process.env.NEXTAUTH_SECRET);
    console.log('🔗 NextAuth URL:', process.env.NEXTAUTH_URL);
    
    const token = await getToken({
      req: request,
      secret: process.env.NEXTAUTH_SECRET,
    });

    console.log('🔐 Token retrieved:', {
      exists: !!token,
      hasId: !!(token?.id),
      email: token?.email,
      name: token?.name
    });

    if (!token) {
      return NextResponse.json({
        status: 'unauthenticated',
        message: 'No valid token found',
        environment: process.env.NODE_ENV,
        timestamp: new Date().toISOString()
      }, { status: 401 });
    }

    if (!token.id) {
      return NextResponse.json({
        status: 'missing_user_id',
        message: 'Token exists but missing user ID',
        token_data: {
          email: token.email,
          name: token.name,
          sub: token.sub,
          iat: token.iat,
          exp: token.exp
        },
        environment: process.env.NODE_ENV,
        timestamp: new Date().toISOString()
      }, { status: 400 });
    }

    return NextResponse.json({
      status: 'authenticated',
      user: {
        id: token.id,
        email: token.email,
        name: token.name
      },
      environment: process.env.NODE_ENV,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Test Auth endpoint error:', error);
    return NextResponse.json({
      status: 'error',
      error: 'Authentication test failed',
      details: error instanceof Error ? error.message : String(error),
      environment: process.env.NODE_ENV,
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}
