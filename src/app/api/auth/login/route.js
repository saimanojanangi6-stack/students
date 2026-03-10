import { NextResponse } from 'next/server';
import { validateCredentials, createToken } from '../../../lib/auth';

export const runtime = 'edge';
export const dynamic = 'force-dynamic';

export async function POST(request) {
  try {
    let body;
    try {
      body = await request.json();
    } catch (e) {
      return NextResponse.json(
        { success: false, error: 'Invalid request' },
        { status: 400 }
      );
    }

    const { username, password } = body;

    if (!username || !password) {
      return NextResponse.json(
        { success: false, error: 'Username and password required' },
        { status: 400 }
      );
    }

    const user = validateCredentials(
      username.trim().toLowerCase(),
      password
    );

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Invalid username or password' },
        { status: 401 }
      );
    }

    const token = await createToken(user);

    const response = NextResponse.json({
      success: true,
      message: `Welcome, ${user.name}!`,
      user: {
        id: user.id,
        name: user.name,
        role: user.role,
        avatar: user.avatar,
        permissions: user.permissions,
      },
    });

    response.cookies.set('auth_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24,
      path: '/',
    });

    return response;
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { success: false, error: 'Login failed' },
      { status: 500 }
    );
  }
}