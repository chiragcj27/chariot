import { NextRequest, NextResponse } from 'next/server';

export async function POST(
  req: NextRequest,
  context: { params: Promise<{ sellerId: string }> }
) {
  const params = await context.params;
  const body = await req.json();
  const backendUrl = `${process.env.BACKEND_API_URL || 'http://localhost:3001'}/api/admin/sellers/${params.sellerId}/reject`;

  const res = await fetch(backendUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  const data = await res.json();
  return NextResponse.json(data, { status: res.status });
} 