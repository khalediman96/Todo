// lib/middleware/auth.middleware.ts
import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';

export async function withAuth(
  request: NextRequest,
  handler: (req: NextRequest, userId: string) => Promise<NextResponse>
) {
  try {
    console.log('🔐 Auth middleware - Starting authentication check');
    console.log('🔐 Request URL:', request.url);
    console.log('🔐 Request method:', request.method);
    console.log('🔐 Environment:', process.env.NODE_ENV);
    console.log('🔐 NextAuth Secret exists:', !!process.env.NEXTAUTH_SECRET);
    console.log('🔐 NextAuth URL:', process.env.NEXTAUTH_URL);
    
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

    if (!token || !token.id) {
      console.log('❌ Authentication failed: No valid token or user ID');
      return NextResponse.json(
        { error: 'Unauthorized - Please sign in' },
        { status: 401 }
      );
    }

    console.log('✅ Authentication successful for user:', token.id);
    return await handler(request, token.id);
  } catch (error) {
    console.error('❌ Auth middleware error:', error);
    console.error('❌ Error details:', {
      name: error instanceof Error ? error.name : 'Unknown',
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    });
    return NextResponse.json(
      { error: 'Authentication failed' },
      { status: 401 }
    );
  }
}

export function createResponse(data: any, status = 200) {
  return NextResponse.json(data, { status });
}

export function createErrorResponse(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status });
}