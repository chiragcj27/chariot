import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const baseBackendUrl = process.env.BACKEND_API_URL || 'http://localhost:3001';
    const backendUrl = `${baseBackendUrl}/api/kits`;
    
    const response = await fetch(backendUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`API responded with status: ${response.status}`);
    }

    const kits = await response.json();
    return NextResponse.json(kits);
  } catch (error) {
    console.error('Error fetching kits:', error);
    return NextResponse.json(
      { error: 'Failed to fetch kits' },
      { status: 500 }
    );
  }
} 