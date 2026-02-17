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
    <form onSubmit={handleSubmit} className="w-full space-y-4">
      <h1 className={`${lusitana.className} mb-6 text-3xl font-bold text-center text-[#294D9D] md:block hidden`}>Passwort ändern</h1>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Altes Passwort</label>
        <div className="relative">
          <input name="old_password" type="password" required className="block w-full rounded-lg border-gray-300 bg-gray-50 p-2.5 text-sm focus:border-blue-500 focus:ring-blue-500" />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Neues Passwort</label>
        <div className="relative">
          <input name="new_password1" type="password" required minLength={6} className="block w-full rounded-lg border-gray-300 bg-gray-50 p-2.5 text-sm focus:border-blue-500 focus:ring-blue-500" />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Neues Passwort wiederholen</label>
        <div className="relative">
          <input name="new_password2" type="password" required minLength={6} className="block w-full rounded-lg border-gray-300 bg-gray-50 p-2.5 text-sm focus:border-blue-500 focus:ring-blue-500" />
        </div>
      </div>

      <Button className="mt-6 w-full bg-[#294D9D] hover:bg-[#1E40AF]" aria-disabled={isPending}>
        Ändern <ArrowRightIcon className="ml-auto h-5 w-5 text-white" />
      </Button>

      {errorMessage && (
        <div className="flex items-center space-x-2 text-red-500 bg-red-50 p-3 rounded-lg mt-4">
          <ExclamationCircleIcon className="h-5 w-5 flex-shrink-0" />
          <p className="text-sm">{errorMessage}</p>
        </div>
      )}

      {successMessage && (
        <div className="flex items-center space-x-2 text-green-600 bg-green-50 p-3 rounded-lg mt-4">
          <p className="text-sm font-medium">{successMessage}</p>
        </div>
      )}
    </form>
  );
}
