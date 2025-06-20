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

  const backendUrl = `${process.env.BACKEND_API_URL || 'http://localhost:3001'}/api/admin/sellers?${queryParams.toString()}`;

  const res = await fetch(backendUrl, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
  });

  const data = await res.json();
  return NextResponse.json(data, { status: res.status });
} 