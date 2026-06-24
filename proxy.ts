import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// NextAuth v5 stores the session JWT in one of these cookies
const SESSION_COOKIES = ['authjs.session-token', '__Secure-authjs.session-token'];

function hasSession(request: NextRequest): boolean {
  return SESSION_COOKIES.some((name) => request.cookies.has(name));
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isAuthenticated = hasSession(request);

  // Redirect logged-in users away from auth pages
  if (isAuthenticated && (pathname === '/login' || pathname === '/register')) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  // Protect dashboard routes — full session validation still happens in the Server Component
  if (!isAuthenticated && pathname.startsWith('/dashboard')) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*', '/login', '/register'],
};
