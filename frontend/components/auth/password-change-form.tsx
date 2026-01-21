/*
import { changePassword } from '@/lib/auth';

await changePassword({
  old_password,
  new_password1,
  new_password2,
});
*/

'use client';

import { lusitana } from '@/components/ui/fonts';
import { ExclamationCircleIcon } from '@heroicons/react/24/outline';
import { ArrowRightIcon } from '@heroicons/react/20/solid';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import { changePassword } from '@/lib/auth';

export default function PasswordChangeForm() {
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isPending, setIsPending] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsPending(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    const formData = new FormData(event.currentTarget);

    const payload = {
      old_password: formData.get('old_password') as string,
      new_password1: formData.get('new_password1') as string,
      new_password2: formData.get('new_password2') as string,
    };

    try {
      await changePassword(payload);
      setSuccessMessage('Passwort erfolgreich geändert!');
    } catch (error: any) {
      setErrorMessage(error.message);
    } finally {
      setIsPending(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div className="rounded-lg bg-gray-50 px-6 pb-4 pt-8">
        <h1 className={`${lusitana.className} mb-3 text-2xl`}>Passwort ändern</h1>

        <label className="block text-xs font-medium mt-3">Altes Passwort</label>
        <input name="old_password" type="password" required className="input" />

        <label className="block text-xs font-medium mt-3">Neues Passwort</label>
        <input name="new_password1" type="password" required minLength={6} className="input" />

        <label className="block text-xs font-medium mt-3">Neues Passwort wiederholen</label>
        <input name="new_password2" type="password" required minLength={6} className="input" />

        <Button className="mt-6 w-full" aria-disabled={isPending}>
          Ändern <ArrowRightIcon className="ml-auto h-5 w-5 text-gray-50" />
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
      </div>
    </form>
  );
}
