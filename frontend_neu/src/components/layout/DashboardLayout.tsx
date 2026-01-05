"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import Sidebar from "./Sidebar";
import { Loader2 } from "lucide-react";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const router = useRouter();
  const { user, isLoading, isAuthenticated } = useAuth();

  useEffect(() => {
    // Zusätzlicher Client-Side-Check als Fallback
    if (!isLoading && !isAuthenticated) {
      router.push("/login");
    }
  }, [isLoading, isAuthenticated, router]);

  // Zeige Loading während Auth-Daten geladen werden
  if (isLoading) {
    return (
      <div className="dashboard-loading">
        <div className="loading-spinner">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
          <p className="loading-text">Lade Benutzerdaten...</p>
        </div>
      </div>
    );
  }

  // Fallback: Wenn Auth fehlschlägt, zeige nichts
  if (!user) {
    return null;
  }

  // Render Dashboard
  return (
    <div className="dashboard-container">
      <Sidebar />
      <main className="main-content">
        {children}
      </main>
    </div>
  );
}
