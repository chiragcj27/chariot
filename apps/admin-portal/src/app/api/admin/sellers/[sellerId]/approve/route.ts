import { NextRequest, NextResponse } from 'next/server';

export async function POST(
  req: NextRequest,
  context: { params: Promise<{ sellerId: string }> }
) {
  const params = await context.params;
  let body = {};
  
  try {
    // Only try to parse JSON if there's content
    const contentType = req.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      const text = await req.text();
      if (text) {
        body = JSON.parse(text);
      }
    }
  } catch (error) {
    console.error('Error parsing request body:', error);
    // Continue with empty body if parsing fails
  }

  const backendUrl = `${process.env.BACKEND_API_URL || 'http://localhost:3001'}/api/admin/sellers/${params.sellerId}/approve`;

  const res = await fetch(backendUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  const data = await res.json();
  return NextResponse.json(data, { status: res.status });
} 