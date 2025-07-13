import { NextRequest, NextResponse } from 'next/server';

const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:3001';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const response = await fetch(`${API_BASE_URL}/api/kits/slug/${slug}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      if (response.status === 404) {
        return NextResponse.json(
          { error: 'Kit not found' },
          { status: 404 }
        );
      }
      throw new Error(`API responded with status: ${response.status}`);
    }

    const kit = await response.json();
    return NextResponse.json(kit);
  } catch (error) {
    console.error('Error fetching kit by slug:', error);
    return NextResponse.json(
      { error: 'Failed to fetch kit' },
      { status: 500 }
    );
  }
} 