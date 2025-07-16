import { NextRequest, NextResponse } from 'next/server';

const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:3001';

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ kitId: string }> }
) {
  try {
    const body = await request.json();
    const { kitId } = await params;
    const accessToken = request.cookies.get('accessToken')?.value;
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    if (accessToken) {
      headers['Authorization'] = `Bearer ${accessToken}`;
    }
    const response = await fetch(`${API_BASE_URL}/api/kits/${kitId}`, {
      method: 'PUT',
      headers,
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errorData = await response.json();
      return NextResponse.json(errorData, { status: response.status });
    }

    const kit = await response.json();
    return NextResponse.json(kit);
  } catch (error) {
    console.error('Error updating kit:', error);
    return NextResponse.json(
      { error: 'Failed to update kit' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ kitId: string }> }
) {
  try {
    const { kitId } = await params;
    const response = await fetch(`${API_BASE_URL}/api/kits/${kitId}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      return NextResponse.json(errorData, { status: response.status });
    }

    const result = await response.json();
    return NextResponse.json(result);
  } catch (error) {
    console.error('Error deleting kit:', error);
    return NextResponse.json(
      { error: 'Failed to delete kit' },
      { status: 500 }
    );
  }
} 