import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// NextAuth v5 stores the session JWT in one of these cookies
const SESSION_COOKIES = ['authjs.session-token', '__Secure-authjs.session-token'];

function hasSession(request: NextRequest): boolean {
  return SESSION_COOKIES.some((name) => request.cookies.has(name));
}

// ล็อกอินอยู่แล้วไม่ต้องเห็นหน้า login / register — ส่งกลับหน้าแรก
// (ยังไม่มีหน้าที่ต้องล็อกอินถึงเข้าได้ — การจองเช็ค session ใน /api/bookings เอง)
export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (hasSession(request) && (pathname === '/login' || pathname === '/register')) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/login', '/register'],
};
