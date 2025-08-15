import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    console.log('Admin buyers API route called');
    const { searchParams } = new URL(request.url);
    const page = searchParams.get('page') || '1';
    const limit = searchParams.get('limit') || '10';
    const status = searchParams.get('status') || 'all';

    console.log('Query params:', { page, limit, status });

    // Get the access token from cookies
    const token = request.cookies.get('accessToken')?.value;
    console.log('Token exists:', !!token);

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Make request to the main API server
    const backendUrl = `${process.env.API_BASE_URL || 'http://localhost:3001'}/api/admin/buyers?page=${page}&limit=${limit}&status=${status}`;
    console.log('Backend URL:', backendUrl);
    
    const response = await fetch(
      backendUrl,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      }
    );

    console.log('Backend response status:', response.status);

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Backend error:', errorData);
      return NextResponse.json(errorData, { status: response.status });
    }

    const data = await response.json();
    console.log('Backend data received');
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching buyers:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
