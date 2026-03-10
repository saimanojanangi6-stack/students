import { NextResponse } from 'next/server';
import { verifyToken } from '../../../lib/auth';

export const runtime = 'edge';
export const dynamic = 'force-dynamic';

export async function GET(request) {
  try {
    const token = request.cookies.get('auth_token')?.value;
    if (!token) return NextResponse.json({ success: false, error: 'No token' }, { status: 401 });

    const user = await verifyToken(token);
    if (!user) {
      const res = NextResponse.json({ success: false, error: 'Expired' }, { status: 401 });
      res.cookies.set('auth_token', '', { maxAge: 0, path: '/' });
      return res;
    }

    return NextResponse.json({
      success: true,
      user: { id: user.id, name: user.name, username: user.username, role: user.role, avatar: user.avatar, permissions: user.permissions },
    });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Auth failed' }, { status: 500 });
  }
}