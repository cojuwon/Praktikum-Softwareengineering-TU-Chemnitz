'use client';

import { lusitana } from '@/components/ui/fonts';
import { ExclamationCircleIcon } from '@heroicons/react/24/outline';
import { ArrowRightIcon } from '@heroicons/react/20/solid';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import { resetPassword } from '@/lib/auth';

export default function ForgotPasswordForm() {
  const [email, setEmail] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isPending, setIsPending] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsPending(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      await resetPassword(email); // ruft /api/auth/password/reset/ auf
      setSuccessMessage(
        'Wenn die Email existiert, wurde ein Link zum Zurücksetzen gesendet.'
      );
    } catch (error: any) {
      setErrorMessage(error.message || 'Fehler beim Zurücksetzen des Passworts');
    } finally {
      setIsPending(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3 max-w-md mx-auto mt-10 p-6 rounded-lg bg-gray-50">
      <h1 className={`${lusitana.className} mb-3 text-2xl`}>Passwort vergessen</h1>

      <label className="block text-xs font-medium mt-3">Email</label>
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
        className="input"
      />

      <Button className="mt-6 w-full" aria-disabled={isPending}>
        Link senden <ArrowRightIcon className="ml-auto h-5 w-5 text-gray-50" />
      </Button>

      {errorMessage && (
        <div className="flex items-center space-x-1 text-red-500 mt-2">
          <ExclamationCircleIcon className="h-5 w-5" />
          <p className="text-sm">{errorMessage}</p>
        </div>
      )}

      {successMessage && (
        <div className="flex items-center space-x-1 text-green-500 mt-2">
          <p className="text-sm">{successMessage}</p>
        </div>
      )}
    </form>
  );
}
