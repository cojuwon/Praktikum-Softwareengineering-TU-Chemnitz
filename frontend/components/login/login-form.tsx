'use client';

import { lusitana } from '@/components/ui/fonts';
import { ExclamationCircleIcon } from '@heroicons/react/24/outline';
import { ArrowRightIcon } from '@heroicons/react/20/solid';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

export default function LoginForm() {
  const router = useRouter();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isPending, setIsPending] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
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

    if (user.rolle_mb === "Admin") {
      router.push("/dashboard/admin");
    } else if (user.rolle_mb === "Erweiterung") {
      router.push("/dashboard/extended");
    } else {
      router.push("/dashboard");
    }
  }

  return (
    <div
      style={{
        overflow: "hidden",
        height: "100vh",
        padding: "10px 24px 0 24px",
        backgroundColor: "#F3EEEE",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
      }}
    >
      <div
        style={{
          maxWidth: "700px",
          margin: "0 auto",
          width: "100%",
        }}
      >
        <Image
          src="/bellis-favicon.png"
          alt=""
          width={100}
          height={100}
          style={{
            width: "60px",
            height: "auto",
            objectFit: "contain",
            display: "block",
            margin: "20px auto",
          }}
        />

        <div
          style={{
            backgroundColor: "white",
            padding: "40px 40px",
            margin: "0 20px 0px 20px",
            borderRadius: "12px 12px 0 0",
          }}
        >
          <h1
            className={`${lusitana.className}`}
            style={{
              fontSize: "28px",
              fontWeight: "600",
              color: "#42446F",
              marginBottom: "6px",
              textAlign: "center",
            }}
          >
            Bitte melden Sie sich an, um fortzufahren
          </h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div
            style={{
              backgroundColor: "white",
              padding: "20px 20px",
              margin: "0 20px",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              borderRadius: "0 0 12px 12px",
            }}
          >
            {/* Email */}
            <label
              className="block text-xs font-medium text-gray-900"
              htmlFor="email"
              style={{ width: "100%", maxWidth: "350px", marginBottom: "6px", textAlign: "left" }}
            >
              Email:
            </label>
            <input
              className="block text-sm"
              id="email"
              type="email"
              name="email"
              required
              style={{
                width: "100%",
                maxWidth: "350px",
                border: "2px solid #052a61ff",
                borderRadius: "6px",
                padding: "10px",
                fontSize: "16px",
                marginBottom: "15px",
                boxSizing: "border-box",
              }}
            />

            {/* Password */}
            <label
              className="mt-4 block text-xs font-medium text-gray-900"
              htmlFor="password"
              style={{ width: "100%", maxWidth: "350px", marginBottom: "6px", textAlign: "left" }}
            >
              Passwort:
            </label>
            <input
              className="block text-sm"
              id="password"
              type="password"
              name="password"
              required
              minLength={6}
              style={{
                width: "100%",
                maxWidth: "350px",
                border: "2px solid #052a61ff",
                borderRadius: "6px",
                padding: "10px",
                fontSize: "16px",
                marginBottom: "15px",
                boxSizing: "border-box",
              }}
            />

            {/* Error Message */}
            {errorMessage && (
              <div className="flex items-center space-x-1 text-red-500 mt-2" style={{ width: "100%", maxWidth: "350px", marginBottom: "15px" }}>
                <ExclamationCircleIcon className="h-5 w-5" />
                <p className="text-sm">{errorMessage}</p>
              </div>
            )}

            {/* Submit Button */}
    <Button 
      className="mt-4" 
      aria-disabled={isPending}
     style={{
    width: "100%",
    maxWidth: "350px",
    backgroundColor: "transparent",
    color: "#131313",
    border: "3px solid #A0A8CD",
    borderRadius: "8px",
    padding: "10px 16px",
    fontSize: "16px",
    fontWeight: "500",
    cursor: "pointer",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  }}
>
  Submit
</Button>
          </div>
        </form>
      </div>

      <Image
        src="/drei-welle-zusammenblau.png"
        alt=""
        width={1400}
        height={100}
        style={{
          width: "150%",
          height: "auto",
          objectFit: "cover",
          transform: "scaleY(1) scaleX(1.21)",
          display: "block",
          marginLeft: "-10%",
        }}
      />
    </div>
  );
}