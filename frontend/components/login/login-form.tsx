// Django muss einen Login Endpoint bereitstellen: POST /api/login/


'use client';   // sagt Next.js diese Komponente wird im Browser ausgeführt, nicht auf dem Server
                // Wir brauchen das, weil: wir useState verwenden, wir useRouter benutzen, wir fetch direkt aus dem Browser machen

import { lusitana } from '@/components/ui/fonts';
import {ExclamationCircleIcon} from '@heroicons/react/24/outline';
import { ArrowRightIcon } from '@heroicons/react/20/solid';
import { Button } from '@/components/ui/button';
import { useState } from 'react';             // um aktuellen status oder Fehlermeldung anzuzeigen
import { useRouter } from 'next/navigation';  // um nach Login weiterzuleiten

export default function LoginForm() {
  const router = useRouter();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);      // Fehlermeldung falls Login fehlschlägt
  const [isPending, setIsPending] = useState(false);                          // zeigt an, dass Login gerade läuft

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {      // wird aufgerufen, wenn submit button geklickt wird
    event.preventDefault();
    setIsPending(true);
    setErrorMessage(null);

    const formData = new FormData(event.currentTarget);
    const email = formData.get("email");
    const password = formData.get("password");

    const response = await fetch("/api/login/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include", 
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      setIsPending(false);
      setErrorMessage("Login fehlgeschlagen");
      return;
    }

    // Login erfolgreich → Cookie ist jetzt im Browser
    // 2. Anfrage um user zu laden:

    const userResponse = await fetch("/api/users/me/", {
      method: "GET",
      credentials: "include",
    });

    if (!userResponse.ok) {
      setIsPending(false);
      setErrorMessage("Benutzerdaten konnten nicht geladen werden.");
      return;
    }

    const user = await userResponse.json();
    console.log("Eingeloggter Nutzer:", user);

   // Weiterleiten anhand der Rolle

    if (user.rolle_mb === "Admin") {
      router.push("/dashboard/admin");
    } else if (user.rolle_mb === "Erweiterung") {
      router.push("/dashboard/extended");
    } else {
      router.push("/dashboard");
    }

  }


  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div className="rounded-lg bg-gray-50 px-6 pb-4 pt-8">
        <h1 className={`${lusitana.className} mb-3 text-2xl`}>
          Please log in to continue.
        </h1>
        <br></br>

        {/* Email */}
        <label
          className="block text-xs font-medium text-gray-900"
          htmlFor="email"
        > Email: 
        </label>

        <input
          className="block w-full rounded-md border border-gray-200 py-[9px] pl-3 text-sm"
          id="email"
          type="email"
          name="email"
          required
        />
        <br></br>

        {/* Password */}
        <label
          className="mt-4 block text-xs font-medium text-gray-900"
          htmlFor="password"
        >
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

        {/* Submit Button */}
        <br></br>
        <Button className="mt-4 w-full" aria-disabled={isPending}>
          Submit <ArrowRightIcon className="ml-auto h-5 w-5 text-gray-50" />
        </Button>

        {/* Error Message */}
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