import { NextResponse } from 'next/server';

const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:3001';

export async function GET() {
  try {
    const response = await fetch(`${API_BASE_URL}/api/kits`, {
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