import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  // Replace with your actual backend API URL
  const backendUrl = `${process.env.BACKEND_API_URL || 'http://localhost:3001'}/api/auth/refresh`;

  // Forward the refreshToken cookie to the backend
  const refreshToken = req.cookies.get('refreshToken')?.value;
  if (!refreshToken) {
    return NextResponse.json({ message: 'No refresh token' }, { status: 401 });
  }

  const res = await fetch(backendUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refreshToken }),
  });

  const data = await res.json();
  if (!res.ok) {
    return NextResponse.json({ message: data.message || 'Invalid refresh token' }, { status: res.status });
  }

  const response = NextResponse.json({ accessToken: data.accessToken });
  // Set new accessToken in httpOnly cookie
  response.cookies.set('accessToken', data.accessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60, // 1 hour
  });
  return response;
} 