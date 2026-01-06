'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { logout } from '@/lib/auth';
import { useUser } from '@/lib/userContext';

export default function Navbar() {
  const { user, setUser } = useUser();
  const router = useRouter();

  async function handleLogout() {
    try {
      await logout();
    } finally {
      setUser(null);
      router.push('/');
    }
  }

  return (
    <nav className="flex items-center justify-between p-4 bg-gray-800 text-white">
      <span className="font-semibold">Dashboard</span>

      <div className="flex gap-4 items-center">
        {/* Alle eingeloggten */}
        <Link href="/dashboard">Home</Link>

        {/* Erweiterung + Admin */}
        {(user?.rolle_mb === 'E' || user?.rolle_mb === 'A') && (
          <Link href="/dashboard/extended">Erweiterung</Link>
        )}

        {/* Nur Admin */}
        {user?.rolle_mb === 'A' && (
          <Link href="/dashboard/admin">Admin</Link>
        )}

        <button
          onClick={handleLogout}
          className="text-red-400 hover:text-red-300"
        >
          Logout
        </button>
      </div>
    </nav>
  );
}


/*'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { logout } from '@/lib/auth';
import { useUser } from '@/lib/userContext';

export default function Navbar() {
  const { user, setUser } = useUser();
  const router = useRouter();

  async function handleLogout() {
    try {
      await logout();
    } catch (e) {
      console.error(e);
    } finally {
      setUser(null);        // 🔥 wichtig
      router.push('/login');
    }
  }

  return (
    <nav className="flex items-center justify-between p-4 bg-gray-800 text-white">
      <span className="font-semibold">Dashboard</span>

      <div className="flex gap-4">
        {user ? (
          <>
            <Link href="/dashboard">Home</Link>

            <button
              onClick={handleLogout}
              className="text-red-400 hover:text-red-300"
            >
              Logout
            </button>
          </>
        ) : (
          <>
            <Link href="/login">Login</Link>
            <Link href="/register">Registrieren</Link>
          </>
        )}
      </div>
    </nav>
  );
}*/

/*
'use client';

import Link from 'next/link';
import { logout } from '@/lib/auth';
import { useUser } from '@/lib/userContext';

export default function Navbar() {
  const { user } = useUser();

  return (
    <nav className="flex gap-4 p-4 bg-gray-800 text-white">
      {user ? (
        <>
          <Link href="/dashboard">Home</Link>
          <button onClick={logout} className="text-red-400">
            Logout
          </button>
        </>
      ) : (
        <>
          <Link href="/login">Login</Link>
          <Link href="/register">Registrieren</Link>
        </>
      )}
    </nav>
  );
}*/

/*
'use client';

import LogoutButton from 'components/auth/logout-button';
import HomeButton from 'components/ui/dashboard/home-button';

export default function Navbar() {
  return (
    <nav className="flex justify-between items-center px-6 py-3 bg-gray-100">
      <div className="text-lg font-bold">Mein Dashboard</div>
      <div>
        <LogoutButton />
      </div>
      <div>
        < HomeButton/>
      </div>
      
    </nav>
  );
}

*/