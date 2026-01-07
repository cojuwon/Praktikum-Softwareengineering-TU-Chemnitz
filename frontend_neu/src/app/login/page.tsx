"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import Image from "next/image";
import { Mail, Lock, AlertCircle, ArrowRight, Loader2 } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isPending, setIsPending] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsPending(true);
    setErrorMessage(null);

    const formData = new FormData(event.currentTarget);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    try {
      await login(email, password);
      router.push("/dashboard");
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Login fehlgeschlagen"
      );
    } finally {
      setIsPending(false);
    }
  }

  return (
    <div className="login-page">
      {/* Background Pattern */}
      <div className="login-bg-pattern"></div>
      <div className="login-bg-gradient"></div>

      {/* Login Card */}
      <div className="login-card">
        {/* Logo */}
        <div className="login-logo">
          <Image
            src="/bellis-favicon.png"
            alt="Bellis e.V. Logo"
            width={80}
            height={80}
            priority
          />
        </div>

        {/* Header */}
        <div className="login-header">
          <h1 className="login-title">Willkommen zurück</h1>
          <p className="login-subtitle">
            Melden Sie sich an, um fortzufahren
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="login-form">
          {/* Email */}
          <div className="form-group">
            <label htmlFor="email" className="form-label">
              E-Mail
            </label>
            <div className="input-wrapper">
              <Mail className="input-icon" />
              <input
                id="email"
                name="email"
                type="email"
                required
                className="form-input"
                placeholder="name@bellis-leipzig.de"
                disabled={isPending}
              />
            </div>
          </div>

          {/* Password */}
          <div className="form-group">
            <label htmlFor="password" className="form-label">
              Passwort
            </label>
            <div className="input-wrapper">
              <Lock className="input-icon" />
              <input
                id="password"
                name="password"
                type="password"
                required
                minLength={6}
                className="form-input"
                placeholder="••••••••"
                disabled={isPending}
              />
            </div>
          </div>

          {/* Error Message */}
          {errorMessage && (
            <div className="error-message">
              <AlertCircle className="w-5 h-5" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isPending}
            className="login-submit-btn"
          >
            {isPending ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Anmeldung läuft...</span>
              </>
            ) : (
              <>
                <span>Anmelden</span>
                <ArrowRight className="w-5 h-5" />
              </>
            )}
          </button>
        </form>

        {/* Footer */}
        <p className="login-footer">
          Bellis e.V. Leipzig - Beratung für Betroffene sexualisierter Gewalt
        </p>
      </div>
    </div>
  );
}
