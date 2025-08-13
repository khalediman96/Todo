// lib/middleware/auth.middleware.ts
import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';

export async function withAuth(
  request: NextRequest,
  handler: (req: NextRequest, userId: string) => Promise<NextResponse>
) {
  try {
    const token = await getToken({
      req: request,
      secret: process.env.NEXTAUTH_SECRET,
    });

    if (!token || !token.id) {
      return NextResponse.json(
        { error: 'Unauthorized - Please sign in' },
        { status: 401 }
      );
    }

    return await handler(request, token.id);
  } catch (error) {
    console.error('Auth middleware error:', error);
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