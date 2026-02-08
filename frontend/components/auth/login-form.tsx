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
      console.log(result.user.rolle_mb);

      // Update UserContext so the app knows we are logged in
      setUser(result.user);

      // Weiterleiten anhand Rolle
      switch (result.user.rolle_mb) {
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

    <form onSubmit={handleSubmit} className="mx-auto w-full max-w-[400px] space-y-3">
      <div className="rounded-lg bg-gray-50 px-6 pb-4 pt-8">
        <h1 className="mb-1 text-center text-[28px] font-semibold text-[#42446F]">
          Anmeldung
        </h1>

        <label className="text-center text-sm text-gray-500" htmlFor="email">
          Email:
        </label>
        <input
          className="block w-full rounded-md border border-gray-200 py-[9px] pl-3 text-sm"
          id="email"
          type="email"
          name="email"
          required
        />

        <label className="text-center text-sm text-gray-500" htmlFor="password">
          Passwort:
        </label>
        <input
          className="block w-full rounded-md border border-gray-200 py-[9px] pl-3 text-sm"
          id="password"
          type="password"
          name="password"
          required
          minLength={6}
        />

        <div className="space-y-2 pt-4">
          <button
            type="submit"
            className="w-full bg-[#294D9D] hover:bg-[#1E40AF] text-white flex justify-center items-center rounded-lg px-6 py-3 text-sm font-medium text-center"
            disabled={isPending}
          >
            Bestätigung
          </button>

          <Link
            href="/forgot-password"
            className="w-full bg-[#294D9D]  hover:bg-blue-400 text-white flex justify-center items-center rounded-lg px-6 py-3 text-sm font-medium text-center"
          >
            Passwort vergessen
          </Link>
        </div>

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