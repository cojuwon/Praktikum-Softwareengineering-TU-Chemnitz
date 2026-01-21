'use client';

import { lusitana } from '@/components/ui/fonts';
import { ExclamationCircleIcon } from '@heroicons/react/24/outline';
import { ArrowRightIcon } from '@heroicons/react/20/solid';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { register } from '@/lib/auth';

export default function RegisterForm() {
  const router = useRouter();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isPending, setIsPending] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsPending(true);
    setErrorMessage(null);

    const formData = new FormData(event.currentTarget);

    const payload = {
      email: formData.get('email') as string,
      password1: formData.get('password1') as string,
      password2: formData.get('password2') as string,
      vorname_mb: formData.get('vorname_mb') as string,
      nachname_mb: formData.get('nachname_mb') as string,
    };

    try {
      await register(payload);
      router.push('/login');
    } catch (error: any) {
      setErrorMessage(error.message);
    } finally {
      setIsPending(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div className="rounded-lg bg-gray-50 px-6 pb-4 pt-8">
        <h1 className={`${lusitana.className} mb-3 text-2xl`}>Registrierung</h1>

        <label className="block text-xs font-medium">Vorname</label>
        <input name="vorname_mb" required className="input" />

        <label className="block text-xs font-medium mt-3">Nachname</label>
        <input name="nachname_mb" required className="input" />

        <label className="block text-xs font-medium mt-3">Email</label>
        <input name="email" type="email" required className="input" />

        <label className="block text-xs font-medium mt-3">Passwort</label>
        <input name="password1" type="password" required minLength={6} className="input" />

        <label className="block text-xs font-medium mt-3">Passwort wiederholen</label>
        <input name="password2" type="password" required minLength={6} className="input" />

        <Button className="mt-6 w-full" aria-disabled={isPending}>
          Registrieren <ArrowRightIcon className="ml-auto h-5 w-5 text-gray-50" />
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

/*'use client';

import { lusitana } from '@/components/ui/fonts';
import { ExclamationCircleIcon } from '@heroicons/react/24/outline';
import { ArrowRightIcon } from '@heroicons/react/20/solid';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { register } from '@/lib/auth';

export default function RegisterForm() {
  const router = useRouter();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isPending, setIsPending] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsPending(true);
    setErrorMessage(null);

    const formData = new FormData(event.currentTarget);

    const payload = {
      email: formData.get('email') as string,
      password1: formData.get('password1') as string,
      password2: formData.get('password2') as string,
      vorname_mb: formData.get('vorname_mb') as string,
      nachname_mb: formData.get('nachname_mb') as string,
    };

    try {
      await register(payload); // ✅ ruft Service auf
      router.push('/login');   // Registrierung erfolgreich → Login
    } catch (error: any) {
      setErrorMessage(error.message);
    } finally {
      setIsPending(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div className="rounded-lg bg-gray-50 px-6 pb-4 pt-8">
        <h1 className={`${lusitana.className} mb-3 text-2xl`}>Registrierung</h1>

        <label className="block text-xs font-medium">Vorname</label>
        <input name="vorname_mb" required className="input" />

        <label className="block text-xs font-medium mt-3">Nachname</label>
        <input name="nachname_mb" required className="input" />

        <label className="block text-xs font-medium mt-3">Email</label>
        <input name="email" type="email" required className="input" />

        <label className="block text-xs font-medium mt-3">Passwort</label>
        <input name="password1" type="password" required minLength={6} className="input" />

        <label className="block text-xs font-medium mt-3">Passwort wiederholen</label>
        <input name="password2" type="password" required minLength={6} className="input" />

        <Button className="mt-6 w-full" aria-disabled={isPending}>
          Registrieren <ArrowRightIcon className="ml-auto h-5 w-5 text-gray-50" />
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