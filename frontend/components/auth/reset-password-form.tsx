'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { confirmResetPassword } from '@/lib/auth';
import { Button } from '@/components/ui/button';
import { lusitana } from '@/components/ui/fonts';
import { ExclamationCircleIcon } from '@heroicons/react/24/outline';

export default function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // UID + Token aus URL
  const uid = searchParams.get('uid') || '';
  const token = searchParams.get('token') || '';

  const [newPassword1, setNewPassword1] = useState('');
  const [newPassword2, setNewPassword2] = useState('');
  const [isPending, setIsPending] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsPending(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    if (newPassword1 !== newPassword2) {
      setErrorMessage('Passwörter stimmen nicht überein');
      setIsPending(false);
      return;
    }

    try {
      await confirmResetPassword({
        uid,
        token,
        new_password1: newPassword1,
        new_password2: newPassword2,
      });

      setSuccessMessage('Passwort erfolgreich zurückgesetzt! Du kannst dich jetzt einloggen.');
      setTimeout(() => router.push('/login'), 2000); // Weiterleitung nach 2 Sekunden
    } catch (err: any) {
      setErrorMessage(err.message || 'Passwort-Reset fehlgeschlagen');
    } finally {
      setIsPending(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3 max-w-md mx-auto mt-10 p-6 rounded-lg bg-gray-50">
      <h1 className={`${lusitana.className} mb-3 text-2xl`}>Neues Passwort setzen</h1>

      <label className="block text-xs font-medium mt-3">Neues Passwort</label>
      <input
        type="password"
        value={newPassword1}
        onChange={(e) => setNewPassword1(e.target.value)}
        required
        minLength={6}
        className="input"
      />

      <label className="block text-xs font-medium mt-3">Passwort wiederholen</label>
      <input
        type="password"
        value={newPassword2}
        onChange={(e) => setNewPassword2(e.target.value)}
        required
        minLength={6}
        className="input"
      />

      <Button className="mt-6 w-full" aria-disabled={isPending}>
        Passwort zurücksetzen
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

/*'use client';

import { useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { confirmResetPassword } from '@/lib/auth';
import { Button } from '@/components/ui/button';

export default function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // UID und Token aus URL holen: /reset-password?uid=xxx&token=yyy
  const uid = searchParams.get('uid') || '';
  const token = searchParams.get('token') || '';

  const [newPassword1, setNewPassword1] = useState('');
  const [newPassword2, setNewPassword2] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    if (newPassword1 !== newPassword2) {
      setError('Passwörter stimmen nicht überein');
      setLoading(false);
      return;
    }

    try {
      await confirmResetPassword({
        uid,
        token,
        new_password1: newPassword1,
        new_password2: newPassword2,
      });
      setSuccess('Passwort erfolgreich geändert! Du kannst dich jetzt einloggen.');
      setTimeout(() => router.push('/login'), 2000);
    } catch (err: any) {
      setError(err.message || 'Passwort-Reset fehlgeschlagen');
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3 max-w-md mx-auto mt-10 p-6 rounded-lg bg-gray-50">
      <h1 className="text-2xl mb-4">Neues Passwort setzen</h1>

      <label className="block text-xs font-medium">Neues Passwort</label>
      <input
        type="password"
        value={newPassword1}
        onChange={(e) => setNewPassword1(e.target.value)}
        required
        minLength={6}
        className="input"
      />

      <label className="block text-xs font-medium mt-3">Passwort wiederholen</label>
      <input
        type="password"
        value={newPassword2}
        onChange={(e) => setNewPassword2(e.target.value)}
        required
        minLength={6}
        className="input"
      />

      <Button type="submit" className="mt-4 w-full" disabled={loading}>
        Passwort ändern
      </Button>

      {success && <p className="text-green-500 mt-2">{success}</p>}
      {error && <p className="text-red-500 mt-2">{error}</p>}
    </form>
  );
}
*/