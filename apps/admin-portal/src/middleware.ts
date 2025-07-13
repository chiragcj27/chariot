import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify } from 'jose';

const PUBLIC_PATHS = [
  '/(auth)/signin',
  '/favicon.ico',
  '/_next',
  '/api/auth/login',
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
    return NextResponse.redirect(new URL('/signin', request.url));
  }

  try {
    // Use your JWT secret here
    const secret = new TextEncoder().encode(process.env.NEXT_PUBLIC_JWT_SECRET || 'chariot_jwt_secret');
    const { payload } = await jwtVerify(accessToken, secret);
    console.log(payload);
    if (payload.role !== 'admin') {
      return NextResponse.redirect(new URL('/signin', request.url));
    }
    return NextResponse.next();
  } catch {
    return NextResponse.redirect(new URL('/signin', request.url));
  }
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|signin).*)'],
}; 