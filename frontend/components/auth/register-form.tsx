'use client';

import { ExclamationCircleIcon, CheckCircleIcon } from '@heroicons/react/24/outline';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import { register } from '@/lib/auth';

export default function RegisterForm() {
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isPending, setIsPending] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

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

    if (payload.password1 !== payload.password2) {
      setErrorMessage("Die Passwörter stimmen nicht überein.");
      setIsPending(false);
      return;
    }

    try {
      await register(payload);
      setIsSuccess(true);
    } catch (error: any) {
      setErrorMessage(error.message);
    } finally {
      setIsPending(false);
    }
  }

  if (isSuccess) {
    return (
      <div className="w-full flex flex-col items-center justify-center text-center p-6 space-y-4">
        <div className="p-4 bg-green-50 rounded-full">
          <CheckCircleIcon className="w-16 h-16 text-green-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900">Registrierung erfolgreich!</h2>
        <p className="text-gray-600">
          Ihr Account wurde erstellt und wartet nun auf Freigabe durch einen Administrator.
          <br />
          Anschließend ist der Login möglich.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="w-full space-y-4">
      <h1 className="mb-6 text-3xl font-bold text-center text-[#294D9D] md:block hidden">Account erstellen</h1>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Vorname</label>
          <input name="vorname_mb" required className="block w-full rounded-lg border-gray-300 bg-gray-50 p-2.5 text-sm focus:border-blue-500 focus:ring-blue-500" placeholder="Max" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Nachname</label>
          <input name="nachname_mb" required className="block w-full rounded-lg border-gray-300 bg-gray-50 p-2.5 text-sm focus:border-blue-500 focus:ring-blue-500" placeholder="Mustermann" />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
        <input name="email" type="email" required className="block w-full rounded-lg border-gray-300 bg-gray-50 p-2.5 text-sm focus:border-blue-500 focus:ring-blue-500" placeholder="name@example.com" />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Passwort</label>
        <input name="password1" type="password" required minLength={6} className="block w-full rounded-lg border-gray-300 bg-gray-50 p-2.5 text-sm focus:border-blue-500 focus:ring-blue-500" placeholder="••••••••" />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Passwort wiederholen</label>
        <input name="password2" type="password" required minLength={6} className="block w-full rounded-lg border-gray-300 bg-gray-50 p-2.5 text-sm focus:border-blue-500 focus:ring-blue-500" placeholder="••••••••" />
      </div>

      <Button
        type="submit"
        className="mt-4"
        aria-disabled={isPending}
      >
        {isPending ? 'Registriere...' : 'Registrieren'}
      </Button>

      {errorMessage && (
        <div className="flex items-center space-x-2 text-red-500 bg-red-50 p-3 rounded-lg mt-4">
          <ExclamationCircleIcon className="h-5 w-5 flex-shrink-0" />
          <p className="text-sm">{errorMessage}</p>
        </div>
      )}
    </form>
  );
}