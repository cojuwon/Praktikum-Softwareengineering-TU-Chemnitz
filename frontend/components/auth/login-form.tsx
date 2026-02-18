'use client';

import { lusitana } from '@/components/ui/fonts';
import { ExclamationCircleIcon } from '@heroicons/react/24/outline';
import { ArrowRightIcon } from '@heroicons/react/20/solid';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { login } from '@/lib/auth';
import Link from 'next/link';
import { useUser } from '@/lib/userContext';

export default function LoginForm() {
  const router = useRouter();
  const { setUser } = useUser();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isPending, setIsPending] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsPending(true);
    setErrorMessage(null);

    const formData = new FormData(event.currentTarget);
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;

    try {
      const result = await login(email, password);

      // Update UserContext so the app knows we are logged in
      setUser(result.user);

      // Weiterleiten anhand Rolle
      switch (result.user.rolle_mb) {
        case 'A':
        case 'AD':
          router.push('/dashboard');
          break;
        case 'E':
          router.push('/dashboard/extended');
          break;
        default:
          router.push('/dashboard');
      }
    } catch (error: any) {
      setErrorMessage(error.message || 'Login fehlgeschlagen');
    } finally {
      setIsPending(false);
    }
  }

  return (

    <form onSubmit={handleSubmit} className="w-full space-y-4">
      <div className="text-center mb-8 md:hidden">
        {/* Mobile Header if needed, but Slider usually handles it. We can keep it minimal */}
      </div>

      {/* Desktop Header for the Form Side */}
      <h1 className="mb-6 text-3xl font-bold text-center text-[#294D9D] md:block hidden">Anmeldung</h1>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="email">
            Email
          </label>
          <div className="relative">
            <input
              className="block w-full rounded-lg border-gray-300 bg-gray-50 p-2.5 text-sm focus:border-blue-500 focus:ring-blue-500"
              id="email"
              type="email"
              name="email"
              placeholder="name@example.com"
              required
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="password">
            Passwort
          </label>
          <div className="relative">
            <input
              className="block w-full rounded-lg border-gray-300 bg-gray-50 p-2.5 text-sm focus:border-blue-500 focus:ring-blue-500"
              id="password"
              type="password"
              name="password"
              placeholder="••••••••"
              required
              minLength={6}
            />
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-3 pt-2">
        <button
          type="submit"
          className="w-full rounded-lg bg-[#294D9D] px-5 py-3 text-sm font-medium text-white hover:bg-[#1E40AF] focus:outline-none focus:ring-4 focus:ring-blue-300 transition-colors shadow-md"
          disabled={isPending}
        >
          {isPending ? 'Logging in...' : 'Anmelden'}
        </button>

        <Link
          href="/forgot-password"
          className="text-center text-sm text-[#294D9D] hover:underline"
        >
          Passwort vergessen?
        </Link>
      </div>

      {errorMessage && (
        <div className="flex items-center space-x-2 text-red-500 bg-red-50 p-3 rounded-lg mt-4">
          <ExclamationCircleIcon className="h-5 w-5 flex-shrink-0" />
          <p className="text-sm">{errorMessage}</p>
        </div>
      )}
    </form>
  );
}

/*

/*'use client';

import { lusitana } from '@/components/ui/fonts';
import { ExclamationCircleIcon } from '@heroicons/react/24/outline';
import { ArrowRightIcon } from '@heroicons/react/20/solid';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { login } from '@/lib/auth'; // ✅ hier importieren

export default function LoginForm() {
  const router = useRouter();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isPending, setIsPending] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsPending(true);
    setErrorMessage(null);

    const formData = new FormData(event.currentTarget);
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;

    try {
      const user = await login({ email, password }); // ✅ ruft Service auf

      // Weiterleitung anhand Rolle
      switch (user.rolle_mb) {
        case 'A':
          router.push('/dashboard/admin');
          break;
        case 'E':
          router.push('/dashboard/extended');
          break;
        default:
          router.push('/dashboard');
      }
    } catch (error: any) {
      setErrorMessage(error.message || 'Login fehlgeschlagen');
    } finally {
      setIsPending(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div className="rounded-lg bg-gray-50 px-6 pb-4 pt-8">
        <h1 className={`${lusitana.className} mb-3 text-2xl`}>
          Please log in to continue.
        </h1>

        <label className="block text-xs font-medium text-gray-900" htmlFor="email">
          Email:
        </label>
        <input
          className="block w-full rounded-md border border-gray-200 py-[9px] pl-3 text-sm"
          id="email"
          type="email"
          name="email"
          required
        />

        <label className="mt-4 block text-xs font-medium text-gray-900" htmlFor="password">
          Password:
        </label>
        <input
          className="block w-full rounded-md border border-gray-200 py-[9px] pl-3 text-sm"
          id="password"
          type="password"
          name="password"
          required
          minLength={6}
        />

        <Button className="mt-4 w-full" aria-disabled={isPending}>
          Submit <ArrowRightIcon className="ml-auto h-5 w-5 text-gray-50" />
        </Button>

        {errorMessage && (
          <div className="flex items-center space-x-1 text-red-500 mt-2">
            <ExclamationCircleIcon className="h-5 w-5" />
            <p className="text-sm">{errorMessage}</p>
          </div>
        )}
      </div>
    </form>
  );
}
*/