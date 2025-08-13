import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest, { params }: { params: { sellerId: string } }) {
  try {
    const baseBackendUrl = process.env.BACKEND_API_URL || 'http://localhost:3001';
    const backendUrl = `${baseBackendUrl}/api/sellers/${params.sellerId}/reapply`;
    
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

    return NextResponse.json(data);
  } catch (error) {
    console.error('Seller reapply error:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
} 