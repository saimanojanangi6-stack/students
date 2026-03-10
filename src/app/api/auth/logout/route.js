import { NextResponse } from 'next/server';

export const runtime = 'edge';
export const dynamic = 'force-dynamic';

export async function POST() {
  const response = NextResponse.json({ success: true });
  response.cookies.set('auth_token', '', { httpOnly: true, maxAge: 0, path: '/' });
  return response;
}