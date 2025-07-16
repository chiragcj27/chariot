import { NextRequest, NextResponse } from 'next/server';

export async function POST(
  req: NextRequest,
  context: { params: Promise<{ sellerId: string }> }
) {
  const params = await context.params;
  let body = {};
  
  try {
    const accessToken = req.cookies.get('accessToken')?.value;
    if (!accessToken) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    if (accessToken) {
      headers['Authorization'] = `Bearer ${accessToken}`;
    }
    // Only try to parse JSON if there's content
    const contentType = req.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      const text = await req.text();
      if (text) {
        body = JSON.parse(text);
      }
    }
    const backendUrl = `${process.env.API_BASE_URL || 'http://localhost:3001'}/api/admin/sellers/${params.sellerId}/approve`;

  const res = await fetch(backendUrl, {
    method: 'POST',
    headers,
    body: JSON.stringify(body),
  });

  const data = await res.json();
  if (!res.ok) {
    return NextResponse.json(data, { status: res.status });
  }

  return NextResponse.json(data, { status: res.status });
  } catch (error) {
    console.error('Error parsing request body:', error);
    // Continue with empty body if parsing fails
  }

  
} 