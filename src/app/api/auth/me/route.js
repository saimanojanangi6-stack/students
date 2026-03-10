import { NextResponse } from 'next/server';
import { verifyToken } from '../../../lib/auth';

export const runtime = 'edge';
export const dynamic = 'force-dynamic';

export async function GET(request) {
  try {
    const token = request.cookies.get('auth_token')?.value;

    if (!token) {
      return NextResponse.json(
        { success: false, error: 'Not authenticated' },
        { status: 401 }
      );
    }

    const user = await verifyToken(token);

    if (!user) {
      const response = NextResponse.json(
        { success: false, error: 'Session expired' },
        { status: 401 }
      );
      response.cookies.set('auth_token', '', {
        maxAge: 0,
        path: '/',
      });
      return response;
    }

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        username: user.username,
        role: user.role,
        avatar: user.avatar,
        permissions: user.permissions,
      },
    });
  } catch (error) {
    console.error('Auth me error:', error);
    return NextResponse.json(
      { success: false, error: 'Auth check failed' },
      { status: 500 }
    );
  }
}