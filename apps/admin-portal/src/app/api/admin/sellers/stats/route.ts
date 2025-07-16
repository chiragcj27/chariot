import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  const backendUrl = `${process.env.API_BASE_URL || 'http://localhost:3001'}/api/admin/sellers/stats`;

  const accessToken = req.cookies.get('accessToken')?.value;
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (accessToken) {
    headers['Authorization'] = `Bearer ${accessToken}`;
  }
  const res = await fetch(backendUrl, {
    method: 'GET',
    headers,
  });

  const data = await res.json();
  return NextResponse.json(data, { status: res.status });
} 