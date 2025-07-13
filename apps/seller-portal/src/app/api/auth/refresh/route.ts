import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    // Get the refresh token from cookies
    const refreshToken = req.cookies.get('refreshToken')?.value;
    
    if (!refreshToken) {
      return NextResponse.json({ message: 'No refresh token provided' }, { status: 401 });
    }

    // Make a request to the backend API to refresh the token
    const backendUrl = process.env.BACKEND_API_URL || 'http://localhost:3001/api/auth/refresh';
    
    const res = await fetch(backendUrl, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ refreshToken })
    });

    const data = await res.json();
    
    if (!res.ok) {
      return NextResponse.json({ 
        message: data.message || 'Failed to refresh token' 
      }, { status: res.status });
    }

    const response = NextResponse.json({ 
      message: 'Token refreshed successfully',
      success: true 
    });

    // Set the new access token in cookies
    if (data.accessToken) {
      response.cookies.set('accessToken', data.accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: 60 * 60, // 1 hour
      });
    }

    // Update refresh token if a new one is provided
    if (data.refreshToken) {
      response.cookies.set('refreshToken', data.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: 60 * 60 * 24 * 30, // 30 days
      });
    }

    return response;
  } catch (error) {
    console.error('Token refresh error:', error);
    return NextResponse.json({ 
      message: 'Failed to refresh token' 
    }, { status: 500 });
  }
} 