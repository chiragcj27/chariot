import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const sellerId = searchParams.get('sellerId');
    const name = searchParams.get('name');
    const status = searchParams.get('status');
    const page = searchParams.get('page');
    const limit = searchParams.get('limit');
    
    const queryParams = new URLSearchParams();
    if (sellerId) queryParams.append('sellerId', sellerId);
    if (name) queryParams.append('name', name);
    if (status) queryParams.append('status', status);
    if (page) queryParams.append('page', page);
    if (limit) queryParams.append('limit', limit);

    // Get access token from cookies
    const accessToken = req.cookies.get('accessToken')?.value;
    if (!accessToken) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const backendUrl = `${process.env.API_BASE_URL || 'http://localhost:3001'}/api/admin/products?${queryParams.toString()}`;

    const res = await fetch(backendUrl, {
      method: 'GET',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
      },
    });

    const data = await res.json();
    
    if (!res.ok) {
      return NextResponse.json(data, { status: res.status });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error in admin products route:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
} 