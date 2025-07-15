import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const { email, password } = await req.json();
  // Replace with your actual backend API URL
  const backendUrl = `${process.env.API_BASE_URL || 'http://localhost:3001'}/api/auth/login`;

  const res = await fetch(backendUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });

  const data = await res.json();
  if (!res.ok) {
    return NextResponse.json({ message: data.message || 'Invalid credentials' }, { status: res.status });
  }

  const response = NextResponse.json({ user: data.user });
  // Set tokens in httpOnly cookies
  response.cookies.set('accessToken', data.accessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60, // 1 hour
  });
  response.cookies.set('refreshToken', data.refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 30, // 30 days
  });
  return response;
} 