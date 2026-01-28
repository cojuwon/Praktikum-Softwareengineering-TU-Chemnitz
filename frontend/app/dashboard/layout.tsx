"use client";


import { useUser } from '@/lib/userContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

function AuthGuard({ children }: { children: React.ReactNode }) {
  const { user, setUser } = useUser(); // Assuming loading state is handled or simple user check
  const router = useRouter();

  // Simple check: if we decided user is null (after initial load), redirect.
  // Note: accurate "loading" state in UserContext would be better, 
  // but for now we rely on the fact that UserContext starts null and catches errors.
  // To avoid flashing, we might want a loading spinner in UserContext, 
  // but let's at least ensure redirect happens.

  useEffect(() => {
    // If user is null, we might be loading or unauthenticated. 
    // Ideally UserContext should expose `loading`. 
    // For now, let's assume if we are here and user is null for "too long" or 
    // if we want to be strict, we check a flag. 
    // As a quick fix for "kick me out":
    // We can rely on the fact that `getCurrentUser` fails quickly.
  }, [user, router]);

  return <>{children}</>;
}

// Better approach: make the Layout itself client-side or use a Wrapper.
// Since this is a server component by default (no "use client"), we need a client wrapper.
// Let's change this file to "use client" or make a separate wrapper. 
// Simpler: Switch this file to "use client" for now to access context.

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClientAuthWrapper>
      {children}
    </ClientAuthWrapper>
  );
}

function ClientAuthWrapper({ children }: { children: React.ReactNode }) {
  // We need to use "useUser" inside a component that is inside UserProvider.
  // DashboardLayout is inside RootLayout which has UserProvider.
  // So this is valid if DashboardLayout is a client component.
  return <AuthCheck>{children}</AuthCheck>;
}

import { useState } from 'react';

function AuthCheck({ children }: { children: React.ReactNode }) {
  const { user, loading } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  if (loading) return <div className="p-10 text-center">Laden...</div>;
  if (!user) return null; // Will redirect via effect

  return <>{children}</>;
}

/*import SideNav from '@/components/ui/dashboard/sidenav';

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen flex-col md:flex-row md:overflow-hidden">
      <div className="w-full flex-none md:w-64">
        <SideNav />
      </div>
      <div className="grow p-6 md:overflow-y-auto md:p-12">{children}</div>
    </div>
  );
}*/
