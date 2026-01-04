import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * Middleware für Authentifizierung und Route-Schutz.
 * 
 * - Schützt /dashboard/* Routen vor unauthentifizierten Zugriffen
 * - Leitet authentifizierte Nutzer von /login zum Dashboard weiter
 * - Prüft Session-Cookie für Authentifizierung
 */
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Prüfe ob Session-Cookie vorhanden (app-auth ist der JWT Cookie vom Django Backend)
  const sessionCookie = request.cookies.get('app-auth') || request.cookies.get('sessionid');
  const isAuthenticated = !!sessionCookie?.value;

  // Öffentliche Routen die keinen Schutz brauchen
  const publicRoutes = ['/', '/login'];
  const isPublicRoute = publicRoutes.includes(pathname);

  // API-Routen und statische Dateien durchlassen
  if (
    pathname.startsWith('/api') ||
    pathname.startsWith('/_next') ||
    pathname.startsWith('/static') ||
    pathname.includes('.') // Dateien wie .png, .ico etc.
  ) {
    return NextResponse.next();
  }

  // Unauthentifizierte Nutzer von geschützten Routen zu Login weiterleiten
  if (!isAuthenticated && pathname.startsWith('/dashboard')) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('callbackUrl', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Authentifizierte Nutzer von Login zum Dashboard weiterleiten
  if (isAuthenticated && pathname === '/login') {
    return NextResponse.redirect(new URL('/dashboard', request.url));
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
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
