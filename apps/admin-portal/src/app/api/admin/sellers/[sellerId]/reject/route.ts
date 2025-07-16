import { NextRequest, NextResponse } from 'next/server';

export async function POST(
  req: NextRequest,
  context: { params: Promise<{ sellerId: string }> }
) {
  const params = await context.params;
  const body = await req.json();
  const accessToken = req.cookies.get('accessToken')?.value;
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (accessToken) {
    headers['Authorization'] = `Bearer ${accessToken}`;
  }
  const backendUrl = `${process.env.API_BASE_URL || 'http://localhost:3001'}/api/admin/sellers/${params.sellerId}/reject`;

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
} 