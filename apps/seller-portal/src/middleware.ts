import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Skip authentication in development
const isDevelopment = process.env.NODE_ENV === 'development';
console.log('isDevelopment', isDevelopment);

export async function middleware(request: NextRequest) {
  // Skip authentication in development
  if (isDevelopment) {
    return NextResponse.next();
  }

  // For production, keep the original authentication logic
  const token = request.cookies.get('accessToken')?.value;
  const { pathname } = request.nextUrl;

  // Public routes that don't require authentication
  const publicRoutes = ['/login', '/register', '/forgot-password'];
  if (publicRoutes.includes(pathname)) {
    return NextResponse.next();
  }

  // Protected routes
  if (!token) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  try {
    const response = await fetch(`${request.nextUrl.origin}/api/auth/verify`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ token }),
    });

    if (!response.ok) {
      return NextResponse.redirect(new URL('/login', request.url));
    }

    const { payload } = await response.json();
    if (payload.role !== 'seller') {
      return NextResponse.redirect(new URL('/unauthorized', request.url));
    }
  } catch (error) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!api|_next/static|_next/image|favicon.ico|public).*)',
  ],
}; 