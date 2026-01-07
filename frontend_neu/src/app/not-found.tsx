"use client";

import Link from "next/link";
import Image from "next/image";
import { Home, ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <div className="error-page">
      {/* Decorative Background Elements */}
      <div className="error-bg-pattern"></div>
      <div className="error-bg-gradient"></div>
      
      {/* Main Card */}
      <div className="error-card">
        {/* Logo */}
        <div className="error-logo">
          <Image
            src="/bellis-favicon.png"
            alt="Bellis e.V. Logo"
            width={64}
            height={64}
            priority
          />
        </div>

        {/* Error Code */}
        <div className="error-code-wrapper">
          <span className="error-code">404</span>
        </div>

        {/* Error Message */}
        <h1 className="error-title">Seite nicht gefunden</h1>
        <p className="error-description">
          Die angeforderte Seite existiert leider nicht oder wurde verschoben.
          Bitte überprüfen Sie die URL oder kehren Sie zur Startseite zurück.
        </p>

        {/* Divider */}
        <div className="error-divider"></div>

        {/* Actions */}
        <div className="error-actions">
          <Link href="/dashboard" className="error-btn error-btn-primary">
            <Home className="w-5 h-5" />
            <span>Zum Dashboard</span>
          </Link>
          <button 
            onClick={() => history.back()} 
            className="error-btn error-btn-secondary"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Zurück</span>
          </button>
        </div>
      </div>

      {/* Footer */}
      <p className="error-footer">
        © 2026 Bellis e.V. Leipzig
      </p>
    </div>
  );
}
