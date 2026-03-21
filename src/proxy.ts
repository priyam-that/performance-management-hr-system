import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getUserByEmail } from './lib/auth';

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Public paths
  if (pathname === '/login' || pathname.startsWith('/_next') || pathname.startsWith('/api')) {
    return NextResponse.next();
  }

  const userEmailCookie = request.cookies.get('crystal_user')?.value;
  const user = userEmailCookie ? getUserByEmail(userEmailCookie) : null;

  if (!user) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // Role based access control mapping
  if (pathname.startsWith('/manager') && user.role !== 'manager') {
    return NextResponse.redirect(new URL('/employee', request.url));
  }

  if (pathname.startsWith('/employee') && user.role !== 'employee') {
    return NextResponse.redirect(new URL('/manager', request.url));
  }

  // Redirect root to appropriate dashboard
  if (pathname === '/') {
    return NextResponse.redirect(new URL(`/${user.role}`, request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
