import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

/**
 * Validates session with Django backend
 */
async function validateSession(sessionCookie: string): Promise<boolean> {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/user/`, {
      method: 'GET',
      headers: {
        'Cookie': `sessionid=${sessionCookie}`,
      },
      // Short timeout to avoid blocking
      signal: AbortSignal.timeout(3000),
    });

    return response.ok;
  } catch (error) {
    console.error('[Middleware] Session validation failed:', error);
    return false;
  }
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Login page is always public
  if (pathname === '/login') {
    return NextResponse.next();
  }

  // For dashboard routes: Check and validate session
  if (pathname.startsWith('/dashboard')) {
    const sessionCookie = request.cookies.get('sessionid');
    
    console.log('[Middleware] Checking dashboard access:', {
      path: pathname,
      hasSessionCookie: !!sessionCookie,
    });

    // No cookie at all - immediate redirect
    if (!sessionCookie) {
      console.log('[Middleware] No session cookie, redirecting to login');
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }

    // Validate the session with backend
    const isValid = await validateSession(sessionCookie.value);

    if (!isValid) {
      console.log('[Middleware] Invalid session, logging out');
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      const response = NextResponse.redirect(loginUrl);
      
      // Clear invalid cookies
      response.cookies.delete('sessionid');
      response.cookies.delete('csrftoken');
      
      return response;
    }

    console.log('[Middleware] Valid session, allowing access');
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/login',
  ],
};
