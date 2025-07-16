import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const status = searchParams.get('status');
  const page = searchParams.get('page');
  const limit = searchParams.get('limit');
  
  const queryParams = new URLSearchParams();
  if (status) queryParams.append('status', status);
  if (page) queryParams.append('page', page);
  if (limit) queryParams.append('limit', limit);

  const backendUrl = `${process.env.API_BASE_URL || 'http://localhost:3001'}/api/admin/sellers?${queryParams.toString()}`;

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
  if (!res.ok) {
    return NextResponse.json(data, { status: res.status });
  }

  return NextResponse.json(data, { status: res.status });
} 