import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    let token: string | undefined;
    
    // Check if token is in request body (for middleware calls)
    const body = await req.json().catch(() => ({}));
    token = body.token;
    
    // If not in body, check Authorization header (for direct API calls)
    if (!token) {
      const authHeader = req.headers.get('authorization');
      if (authHeader && authHeader.startsWith('Bearer ')) {
        token = authHeader.substring(7); // Remove 'Bearer ' prefix
      }
    }

    if (!token) {
      return NextResponse.json({ message: 'No token provided' }, { status: 401 });
    }

    // Make a request to the backend API to verify the token
    const backendUrl = process.env.BACKEND_API_URL || 'http://localhost:3001/api/auth/verify';
    
    const res = await fetch(backendUrl, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
    });

    const data = await res.json();
    
    if (!res.ok) {
      return NextResponse.json({ 
        success: false, 
        message: data.message || 'Invalid token' 
      }, { status: res.status });
    }

    return NextResponse.json({ 
      success: true, 
      payload: data.payload 
    });
  } catch (error) {
    return NextResponse.json({ 
      success: false, 
      message: 'Invalid token' 
    }, { status: 401 });
  }
} 