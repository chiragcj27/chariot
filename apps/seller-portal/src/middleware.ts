import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify } from 'jose';

const PUBLIC_PATHS = [
  '/login',
  '/register',
  '/favicon.ico',
  '/_next',
  '/api/sellers/login',
  '/api/sellers/register',
  '/api/auth/logout',
  '/api/auth/refresh',
];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  if (PUBLIC_PATHS.some((path) => pathname.startsWith(path))) {
    return NextResponse.next();
  }

  const accessToken = request.cookies.get('accessToken')?.value;
  if (!accessToken) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  try {
    // Use your JWT secret here
    const secret = new TextEncoder().encode(process.env.NEXT_PUBLIC_JWT_SECRET || 'chariot_jwt_secret');
    const { payload } = await jwtVerify(accessToken, secret);
    if (payload.role !== 'seller') {
      return NextResponse.redirect(new URL('/login', request.url));
    }
    return NextResponse.next();
  } catch {
    return NextResponse.redirect(new URL('/login', request.url));
  }
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|login|register).*)'],
}; 