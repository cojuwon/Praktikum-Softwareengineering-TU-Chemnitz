import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function proxy(request: NextRequest) {
  // Check for the correct cookie name 'app-auth'
  const token = request.cookies.get('app-auth');
  // Fallback: also check 'accessToken' just in case, or if logic changes
  const tokenLegacy = request.cookies.get('accessToken');

  if (
    request.nextUrl.pathname.startsWith('/dashboard') &&
    !token && !tokenLegacy
  ) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*'],
}
