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
        console.log('Products POST - No access token, attempting refresh...');
        
        // Try to refresh via direct backend call
        const backendUrl = process.env.BACKEND_API_URL || 'http://localhost:3001/api/auth/refresh';
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
          console.log('Products POST - Token refreshed successfully');
        }
      }
      
      if (!accessToken) {
        console.log('Products POST - No valid token available, refresh failed');
        return NextResponse.json({ 
          message: 'No token provided - please login again',
          needsLogin: true
        }, { status: 401 });
      }
    }

    // Get the request body
    const body = await req.json();

    // Forward the request to the backend API
    const backendUrl = process.env.BACKEND_API_URL || 'http://localhost:3001/api/products';
    
    const response = await fetch(backendUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`
      },
      body: JSON.stringify(body),
    });

    const data = await response.json();
    
    if (!response.ok) {
      return NextResponse.json(data, { status: response.status });
    }

    const nextResponse = NextResponse.json(data);
    
    // Set new cookies if tokens were refreshed
    if (newAccessToken) {
      nextResponse.cookies.set('accessToken', newAccessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: 60 * 60, // 1 hour
      });
    }
    
    if (newRefreshToken) {
      nextResponse.cookies.set('refreshToken', newRefreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: 60 * 60 * 24 * 30, // 30 days
      });
    }
    
    return nextResponse;
  } catch (error) {
    console.error('Product creation error:', error);
    return NextResponse.json(
      { message: 'Internal server error' }, 
      { status: 500 }
    );
  }
}

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
        console.log('Products GET - No access token, attempting refresh...');
        
        // Try to refresh via direct backend call
        const backendUrl = process.env.BACKEND_API_URL || 'http://localhost:3001/api/auth/refresh';
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
          console.log('Products GET - Token refreshed successfully');
        }
      }
      
      if (!accessToken) {
        console.log('Products GET - No valid token available, refresh failed');
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
    const limit = searchParams.get('limit') || '10';

    // Build the backend URL with query parameters - use seller endpoint
    const backendUrl = new URL(process.env.BACKEND_API_URL || 'http://localhost:3001/api/products/seller');
    if (status) backendUrl.searchParams.set('status', status);
    backendUrl.searchParams.set('page', page);
    backendUrl.searchParams.set('limit', limit);
    
    const response = await fetch(backendUrl.toString(), {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${accessToken}`
      },
    });

    const data = await response.json();
    
    if (!response.ok) {
      return NextResponse.json(data, { status: response.status });
    }

    const nextResponse = NextResponse.json(data);
    
    // Set new cookies if tokens were refreshed
    if (newAccessToken) {
      nextResponse.cookies.set('accessToken', newAccessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: 60 * 60, // 1 hour
      });
    }
    
    if (newRefreshToken) {
      nextResponse.cookies.set('refreshToken', newRefreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: 60 * 60 * 24 * 30, // 30 days
      });
    }
    
    return nextResponse;
  } catch (error) {
    console.error('Product fetch error:', error);
    return NextResponse.json(
      { message: 'Internal server error' }, 
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest) {
  try {
    // Get the access token from cookies
    let accessToken = req.cookies.get('accessToken')?.value;
    let newAccessToken = null;
    let newRefreshToken = null;
    
    // If no access token, try to refresh using refresh token
    if (!accessToken) {
      const refreshToken = req.cookies.get('refreshToken')?.value;
      
      if (refreshToken) {
        console.log('Products PUT - No access token, attempting refresh...');
        
        // Try to refresh via direct backend call
        const backendUrl = process.env.BACKEND_API_URL || 'http://localhost:3001/api/auth/refresh';
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
          console.log('Products PUT - Token refreshed successfully');
        }
      }
      
      if (!accessToken) {
        console.log('Products PUT - No valid token available, refresh failed');
        return NextResponse.json({ 
          message: 'No token provided - please login again',
          needsLogin: true
        }, { status: 401 });
      }
    }

    // Get the request body
    const body = await req.json();
    const { searchParams } = new URL(req.url);
    const productId = searchParams.get('id');

    if (!productId) {
      return NextResponse.json({ message: 'Product ID is required' }, { status: 400 });
    }

    // Forward the request to the backend API
    const backendUrl = `${process.env.BACKEND_API_URL || 'http://localhost:3001/api/products'}/${productId}`;
    
    const response = await fetch(backendUrl, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`
      },
      body: JSON.stringify(body),
    });

    const data = await response.json();
    
    if (!response.ok) {
      return NextResponse.json(data, { status: response.status });
    }

    const nextResponse = NextResponse.json(data);
    
    // Set new cookies if tokens were refreshed
    if (newAccessToken) {
      nextResponse.cookies.set('accessToken', newAccessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: 60 * 60, // 1 hour
      });
    }
    
    if (newRefreshToken) {
      nextResponse.cookies.set('refreshToken', newRefreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: 60 * 60 * 24 * 30, // 30 days
      });
    }
    
    return nextResponse;
  } catch (error) {
    console.error('Product update error:', error);
    return NextResponse.json(
      { message: 'Internal server error' }, 
      { status: 500 }
    );
  }
} 