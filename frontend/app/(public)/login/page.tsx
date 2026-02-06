'use client';
import LoginForm from '@/components/auth/login-form';
import { Suspense } from 'react';
import Link from 'next/link';

export default function LoginPage() {
  return (
     <div className="min-h-screen flex items-center justify-center bg-[#F3EEEE] px-4">
    <div>
   
        <Suspense fallback={<div>Loading form...</div>}>
          <LoginForm />
        </Suspense>
      </div>
      </div>

  );
}
