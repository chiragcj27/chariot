import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    // Get the access token from cookies
    let accessToken = req.cookies.get('accessToken')?.value;
    let newAccessToken = null;
    let newRefreshToken = null;
    
    // If no access token, try to refresh using refresh token
    if (!accessToken) {
      const refreshToken = req.cookies.get('refreshToken')?.value;
      
      if (refreshToken) {
        // Try to refresh via direct backend call
        const baseBackendUrl = process.env.BACKEND_API_URL || 'http://localhost:3001';
        const backendUrl = `${baseBackendUrl}/api/auth/refresh`;
        const backendRefresh = await fetch(backendUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ refreshToken })
        });
        
        if (backendRefresh.ok) {
          const backendData = await backendRefresh.json();
          accessToken = backendData.accessToken;
          newAccessToken = backendData.accessToken;
          newRefreshToken = backendData.refreshToken;
        }
      }
      
      if (!accessToken) {
        return NextResponse.json({ 
          message: 'No token provided - please login again',
          needsLogin: true
        }, { status: 401 });
      }
    }

    const body = await req.json();
    const { requestedAmount } = body;

    // Forward the request to the backend API
    const baseBackendUrl = process.env.BACKEND_API_URL || 'http://localhost:3001';
    const backendUrl = `${baseBackendUrl}/api/marketplace/payout/request`;
    
    const response = await fetch(backendUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ requestedAmount }),
    });

    const data = await response.json();
    
    if (!response.ok) {
      return NextResponse.json(data, { status: response.status });
    }

    // Set new tokens in cookies if they were refreshed
    const nextResponse = NextResponse.json(data);
    if (newAccessToken) {
      nextResponse.cookies.set('accessToken', newAccessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 7, // 7 days
      });
    }
    if (newRefreshToken) {
      nextResponse.cookies.set('refreshToken', newRefreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 30, // 30 days
      });
    }

    return nextResponse;
  } catch (error) {
    console.error('Error creating payout request:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}

