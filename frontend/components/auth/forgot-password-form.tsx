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
    <form onSubmit={handleSubmit} className="w-full space-y-4">
      <h1 className="mb-6 text-3xl font-bold text-center text-[#294D9D] md:block hidden">Passwort vergessen</h1>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="block w-full rounded-lg border-gray-300 bg-gray-50 p-2.5 text-sm focus:border-blue-500 focus:ring-blue-500"
            placeholder="name@example.com"
          />
        </div>
      </div>

      <Button
        type="submit"
        className="mt-4"
        aria-disabled={isPending}
      >
        {isPending ? 'Sende...' : 'Link senden'}
      </Button>

      <div className="text-center mt-4">
        <a href="/login" className="text-sm text-[#294D9D] hover:underline">
          Zurück zur Anmeldung
        </a>
      </div>

      {errorMessage && (
        <div className="flex items-center space-x-2 text-red-500 bg-red-50 p-3 rounded-lg mt-4">
          <ExclamationCircleIcon className="h-5 w-5 flex-shrink-0" />
          <p className="text-sm">{errorMessage}</p>
        </div>
      )}

      {successMessage && (
        <div className="flex items-center space-x-2 text-green-600 bg-green-50 p-3 rounded-lg mt-4">
          <p className="text-sm">{successMessage}</p>
        </div>
      )}
    </form>
  );
}
