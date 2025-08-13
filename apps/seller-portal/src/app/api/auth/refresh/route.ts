import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const baseBackendUrl = process.env.BACKEND_API_URL || 'http://localhost:3001';
    const backendUrl = `${baseBackendUrl}/api/auth/refresh`;
    
    const body = await req.json();
    const response = await fetch(backendUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(data, { status: response.status });
    }

    const nextResponse = NextResponse.json(data);

    // Set new cookies
    if (data.accessToken) {
      nextResponse.cookies.set('accessToken', data.accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: 60 * 60, // 1 hour
      });
    }

    if (data.refreshToken) {
      nextResponse.cookies.set('refreshToken', data.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: 60 * 60 * 24 * 30, // 30 days
      });
    }

    return nextResponse;
  } catch (error) {
    console.error('Refresh error:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
} 