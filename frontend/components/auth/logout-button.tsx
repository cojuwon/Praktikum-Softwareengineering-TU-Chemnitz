'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { logout } from '@/lib/auth';
import { Button } from '@/components/ui/button';

export default function LogoutButton() {
  const router = useRouter();
  const [isPending, setIsPending] = useState(false);

  async function handleLogout() {
    setIsPending(true);
    try {
      await logout();
      // Optional: Lokale State löschen, z.B. UserContext
      router.push('/'); // Nach Logout auf Startseite
    } catch (err: any) {
      console.error(err.message);
    } finally {
      setIsPending(false);
    }
  }

  return (
    <Button onClick={handleLogout} aria-disabled={isPending}>
      Logout
    </Button>
  );
}

/*'use client';
import { logout } from '@/lib/auth';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';

export default function LogoutButton() {
  const router = useRouter();

  async function handleLogout() {
    await logout();
    router.push('/login');
  }

  return <Button onClick={handleLogout}>Logout</Button>;
}*/
