'use client';
import RegisterForm from '@/components/auth/register-form';
import { Suspense } from 'react';

export default function RegisterPage() {
  return (
    <main className="flex items-center justify-center md:h-screen">
      <div className="relative mx-auto flex w-full max-w-[400px] flex-col space-y-2.5 p-4">
        <Suspense fallback={<div>Loading form...</div>}>
          <RegisterForm />
        </Suspense>
      </div>
    </main>
  );
}
