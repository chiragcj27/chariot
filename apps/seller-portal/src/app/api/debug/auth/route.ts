import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  try {
    // Get the access token from cookies
    const accessToken = req.cookies.get('accessToken')?.value;
    const refreshToken = req.cookies.get('refreshToken')?.value;
    
    // Get all cookies for debugging
    const allCookies = Object.fromEntries(
      Array.from(req.cookies.getAll()).map(cookie => [cookie.name, cookie.value])
    );

    return NextResponse.json({
      hasAccessToken: !!accessToken,
      hasRefreshToken: !!refreshToken,
      accessTokenLength: accessToken?.length || 0,
      refreshTokenLength: refreshToken?.length || 0,
      allCookies: allCookies,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Debug auth error:', error);
    return NextResponse.json(
      { 
        error: 'Debug endpoint failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      }, 
      { status: 500 }
    );
  }
} 