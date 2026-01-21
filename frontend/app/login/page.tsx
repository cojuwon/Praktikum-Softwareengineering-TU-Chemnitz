'use client';
import LoginForm from '@/components/auth/login-form';
import { Suspense } from 'react';
import Link from 'next/link';

export default function LoginPage() {
  return (
    <main className="flex items-center justify-center md:h-screen">
      <div className="relative mx-auto flex w-full max-w-[400px] flex-col space-y-2.5 p-4">
        <Suspense fallback={<div>Loading form...</div>}>
          <LoginForm />
        </Suspense>
        <Link
        href="/forgot-password"
        className="flex items-center gap-5 self-start rounded-lg bg-blue-500 px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-blue-400 md:text-base"
        >
          <span>Passwort vergessen</span> 
        </Link>
      </div>
    </main>
  );
}