'use client';

import PasswordChangeForm from '@/components/auth/password-change-form';
import { Suspense } from 'react';
import { lusitana } from '@/components/ui/fonts';
import { ShieldCheckIcon } from '@heroicons/react/24/outline'; // Or any suitable icon
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function ChangePasswordPage() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-[#F3EEEE] p-4">
      {/* Back Button */}
      <div className="absolute top-6 left-6">
        <Link href="/dashboard/settings" className="flex items-center gap-2 text-gray-600 hover:text-[#294D9D] transition-colors font-medium">
          <ArrowLeft size={20} />
          Zurück zu Einstellungen
        </Link>
      </div>

      <div className="relative w-full max-w-[900px] min-h-[500px] bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col md:flex-row">

        {/* Left Side: Blue Panel */}
        <div className="w-full md:w-1/2 bg-[#294D9D] text-white p-12 flex flex-col items-center justify-center text-center">
          <div className="mb-6 p-4 bg-white/10 rounded-full backdrop-blur-sm">
            <ShieldCheckIcon className="w-16 h-16 text-white" />
          </div>
          <h1 className={`${lusitana.className} text-3xl font-bold mb-4`}>
            Sicherheitseinstellungen
          </h1>
          <p className="text-blue-100 max-w-xs leading-relaxed">
            Aktualisieren Sie Ihr Passwort regelmäßig, um Ihren Account bestmöglich zu schützen.
          </p>
        </div>

        {/* Right Side: Form */}
        <div className="w-full md:w-1/2 p-8 md:p-12 flex flex-col justify-center">
          <Suspense fallback={<div>Loading form...</div>}>
            <PasswordChangeForm />
          </Suspense>
        </div>

      </div>
    </main>
  );
}
