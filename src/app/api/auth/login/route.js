import { NextResponse } from 'next/server';
import { validateCredentials, createToken } from '../../../lib/auth';

export const runtime = 'edge';
export const dynamic = 'force-dynamic';

export async function POST(request) {
  try {
    const body = await request.json();
    const { username, password } = body;

    if (!username || !password) {
      return NextResponse.json({ success: false, error: 'Credentials required' }, { status: 400 });
    }

    const user = validateCredentials(username.trim().toLowerCase(), password);
    if (!user) {
      return NextResponse.json({ success: false, error: 'Invalid credentials' }, { status: 401 });
    }

    const token = await createToken(user);

    const response = NextResponse.json({
      success: true,
      message: `Welcome, ${user.name}!`,
      user: { id: user.id, name: user.name, role: user.role, avatar: user.avatar, permissions: user.permissions },
    });

    response.cookies.set('auth_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 86400,
      path: '/',
    });

    return response;
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Login failed' }, { status: 500 });
  }
}