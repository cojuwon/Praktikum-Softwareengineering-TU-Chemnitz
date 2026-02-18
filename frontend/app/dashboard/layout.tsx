"use client";

import { useUser } from '@/lib/userContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';


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
