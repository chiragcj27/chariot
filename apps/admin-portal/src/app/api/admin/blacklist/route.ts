import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const backendUrl = `${process.env.BACKEND_API_URL || 'http://localhost:3001'}/api/admin/blacklist`;

    const res = await fetch(backendUrl, {
      method: 'GET',
      headers: { 
        'Content-Type': 'application/json',
      },
    });

    const data = await res.json();
    
    if (!res.ok) {
      return NextResponse.json(data, { status: res.status });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error in blacklist route:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
} 