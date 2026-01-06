import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

/**
 * Server-Side Auth Check für Server Components
 * Prüft Session-Cookie und leitet bei fehlender Auth um
 */
export async function requireAuth() {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get('app-auth'); // Changed from 'sessionid'

  if (!sessionCookie) {
    redirect('/login');
  }

  return true;
}

export async function isAuthenticated(): Promise<boolean> {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get('app-auth'); // Changed from 'sessionid'
  return !!sessionCookie;
}