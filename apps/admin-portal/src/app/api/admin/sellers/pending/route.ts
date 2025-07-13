import { NextResponse } from 'next/server';

export async function GET() {
  const backendUrl = `${process.env.BACKEND_API_URL || 'http://localhost:3001'}/api/admin/sellers/pending`;

  const res = await fetch(backendUrl, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
  });

  const data = await res.json();
  return NextResponse.json(data, { status: res.status });
} 