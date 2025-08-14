// app/api/auth-test/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../../lib/auth';

export async function GET(request: NextRequest) {
  try {
    // Get the current session
    const session = await getServerSession(authOptions);
    
    // Check environment variables
    const envCheck = {
      NODE_ENV: process.env.NODE_ENV,
      NEXTAUTH_URL: process.env.NEXTAUTH_URL,
      hasGoogleClientId: !!process.env.GOOGLE_CLIENT_ID,
      hasGoogleClientSecret: !!process.env.GOOGLE_CLIENT_SECRET,
      hasNextAuthSecret: !!process.env.NEXTAUTH_SECRET,
      googleClientIdPrefix: process.env.GOOGLE_CLIENT_ID?.substring(0, 20) + '...',
    };

    // Check if the URL in the request matches NEXTAUTH_URL
    const requestUrl = new URL(request.url);
    const expectedBaseUrl = process.env.NEXTAUTH_URL;
    
    return NextResponse.json({
      session: session ? {
        user: session.user,
        expires: session.expires
      } : null,
      environment: envCheck,
      urlCheck: {
        requestHost: requestUrl.host,
        expectedHost: expectedBaseUrl ? new URL(expectedBaseUrl).host : 'undefined',
        match: requestUrl.host === (expectedBaseUrl ? new URL(expectedBaseUrl).host : ''),
      },
      authUrls: {
        signIn: `${expectedBaseUrl}/api/auth/signin`,
        callback: `${expectedBaseUrl}/api/auth/callback/google`,
        providers: `${expectedBaseUrl}/api/auth/providers`,
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Auth test error:', error);
    return NextResponse.json({
      error: {
        message: error instanceof Error ? error.message : 'Unknown error',
        name: error instanceof Error ? error.name : 'Unknown',
      },
      timestamp: new Date().toISOString(),
    }, { status: 500 });
  }
}
