import { NextRequest, NextResponse } from 'next/server';

const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:3001';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ kitSlug: string }> }
) {
  try {
    const { kitSlug } = await params;
    const { searchParams } = new URL(request.url);
    const typeOfKit = searchParams.get('typeOfKit');
    const page = searchParams.get('page');
    const limit = searchParams.get('limit');

    // Build the backend URL with query parameters
    const url = new URL(`${API_BASE_URL}/api/products/kit/${kitSlug}`);
    if (typeOfKit) url.searchParams.set('typeOfKit', typeOfKit);
    if (page) url.searchParams.set('page', page);
    if (limit) url.searchParams.set('limit', limit);
    const backendUrl = url.toString();

    const response = await fetch(backendUrl.toString(), {
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

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching kit products:', error);
    return NextResponse.json(
      { error: 'Failed to fetch kit products' },
      { status: 500 }
    );
  }
}
