import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
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
        const baseBackendUrl = process.env.API_BASE_URL || 'http://localhost:3001';
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

    // Get query parameters
    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status');
    const page = searchParams.get('page') || '1';
    const limit = searchParams.get('limit') || '20';

    // Forward the request to the backend API
    const baseBackendUrl = process.env.API_BASE_URL || 'http://localhost:3001';
    const backendUrl = `${baseBackendUrl}/api/marketplace/payout/requests?page=${page}&limit=${limit}${status ? `&status=${status}` : ''}`;
    
    const response = await fetch(backendUrl, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${accessToken}`
      },
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
        maxAge: 15 * 60, // 15 minutes
      });
    }
    if (newRefreshToken) {
      nextResponse.cookies.set('refreshToken', newRefreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60, // 7 days
      });
    }

    return nextResponse;
  } catch (error) {
    console.error('Error fetching payout requests:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}

