import { NextRequest, NextResponse } from 'next/server';

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ productId: string }> }
) {
  try {
    const { productId } = await params;
    const body = await req.json();
    
    // Get access token from cookies
    const accessToken = req.cookies.get('accessToken')?.value;
    if (!accessToken) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }
    
    const backendUrl = `${process.env.API_BASE_URL || 'http://localhost:3001'}/api/admin/products/${productId}/reject`;

    const res = await fetch(backendUrl, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
      },
      body: JSON.stringify(body),
    });

    const data = await res.json();
    
    if (!res.ok) {
      return NextResponse.json(data, { status: res.status });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error in reject product route:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
} 