import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const API_BASE_URL = process.env.DJANGO_INTERNAL_HOST 
  ? `${process.env.DJANGO_INTERNAL_HOST}/api`
  : (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api');

async function validateSession(token: string): Promise<boolean> {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/user/`, {
      method: 'GET',
      headers: {
        // Send the token in the Cookie header as expected by the backend
        'Cookie': `app-auth=${token}`, 
      },
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

  if (pathname === '/login') {
    return NextResponse.next();
  }

  if (pathname.startsWith('/dashboard')) {
    // CHANGE: Check for 'app-auth' instead of 'sessionid'
    const authCookie = request.cookies.get('app-auth'); 
    


    if (!authCookie) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }

    const isValid = await validateSession(authCookie.value);

    if (!isValid) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      const response = NextResponse.redirect(loginUrl);
      
      // CHANGE: Clear the correct cookies
      response.cookies.delete('app-auth');
      response.cookies.delete('app-refresh-token'); // Clear refresh token too if present
      
      return response;
    }

  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/login',
  ],
};