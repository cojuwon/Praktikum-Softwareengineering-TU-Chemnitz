'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { User, AuthState } from '@/types/auth';

import { SessionTimeoutModal } from '@/components/auth/SessionTimeoutModal';

// API Base URL - sollte in einer .env Datei konfiguriert werden
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

// Konfiguration für Timeouts
const INACTIVITY_TIMEOUT_MS = 30 * 60 * 1000; // 30 Minuten
const WARNING_BEFORE_MS = 5 * 60 * 1000;      // 5 Minuten Warnung vorher
const REFRESH_INTERVAL_MS = 4 * 60 * 1000;    // Alle 4 Minuten Refresh versuchen (wenn aktiv)

interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [state, setState] = useState<AuthState>({
    user: null,
    isLoading: true,
    isAuthenticated: false,
    error: null,
  });

  // State für Inaktivitäts-Modal
  const [showTimeoutModal, setShowTimeoutModal] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);

  // Ref für letzte Aktivität (initiiert mit JETZT)
  const lastActivityRef = React.useRef<number>(Date.now());
  const lastRefreshRef = React.useRef<number>(Date.now());

  /**
   * Lädt die Benutzerdaten vom /auth/user/ Endpoint.
   * Dieser Endpoint liefert auch permissions und groups zurück.
   */
  const fetchUser = useCallback(async (): Promise<User | null> => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/user/`, {
        method: 'GET',
        credentials: 'include', // Wichtig für Cookie-basierte Auth
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        if (response.status === 401) {
          return null; // Nicht eingeloggt
        }
        throw new Error('Fehler beim Laden der Benutzerdaten');
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching user:', error);
      return null;
    }
  }, []);

  /**
   * Aktualisiert das Access Token via Refresh Endpoint
   */
  const refreshAuthToken = useCallback(async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/token/refresh/`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
      });
      if (response.ok) {
        lastRefreshRef.current = Date.now();
        // Optional: User Daten neu laden um sicherzugehen
        // await refreshUser(); 
      } else {
        // Falls Refresh fehlschlägt (z.B. Refresh Token abgelaufen -> 15h Limit), ausloggen
        if (response.status === 401) {
          console.log("Auto-Refresh failed (401), logging out...");
          // logout wird weiter unten definiert, wir können es hier nicht direkt aufrufen ohne zirkuläre Abhängigkeit
          // Workaround: State setzen oder logout als prop übergeben, oder einfachen reload erzwingen
          // Wir lassen den nächsten checkActivity Zyklus das Logout übernehmen oder den Fehlerstatus setzen.
        }
      }
    } catch (e) {
      console.error("Silent refresh failed", e);
    }
  }, []);

  /**
   * Aktualisiert die Benutzerdaten (z.B. nach Änderungen an Berechtigungen)
   */
  const refreshUser = useCallback(async () => {
    const user = await fetchUser();
    setState(prev => ({
      ...prev,
      user,
      isAuthenticated: !!user,
      isLoading: false,
    }));
  }, [fetchUser]);

  /**
   * Login mit E-Mail und Passwort
   */
  const login = useCallback(async (email: string, password: string) => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const response = await fetch(`${API_BASE_URL}/auth/login/`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.detail || data.non_field_errors?.[0] || 'Login fehlgeschlagen');
      }

      // Nach erfolgreichem Login User-Daten laden
      const user = await fetchUser();

      // Reset Activity Timer
      lastActivityRef.current = Date.now();
      lastRefreshRef.current = Date.now();
      setShowTimeoutModal(false);

      setState({
        user,
        isAuthenticated: !!user,
        isLoading: false,
        error: null,
      });
    } catch (error) {
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Ein Fehler ist aufgetreten',
      }));
      throw error;
    }
  }, [fetchUser]);

  /**
   * Logout
   */
  const logout = useCallback(async () => {
    setState(prev => ({ ...prev, isLoading: true }));

    try {
      await fetch(`${API_BASE_URL}/auth/logout/`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });
    } catch (error) {
      console.error('Logout error:', error);
    }

    setState({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
    });
    setShowTimeoutModal(false);
  }, []);

  // --- ACTIVITY MONITORING ---

  // Event Listener für Benutzeraktivität
  useEffect(() => {
    if (!state.isAuthenticated) return;

    const handleActivity = () => {
      lastActivityRef.current = Date.now();
      // Wenn Modal offen war und User etwas macht -> schließen
      // (Wir machen das im Interval Check, damit es nicht flackert, 
      // aber wir können es auch hier direkt resetten wenn gewünscht. 
      // Hier aktualisieren wir nur den Timestamp.)
    };

    const events = ['mousedown', 'keydown', 'scroll', 'touchstart'];

    // Throttled event listener attachment could be better, but native events are okay monitoring-wise
    events.forEach(event => window.addEventListener(event, handleActivity));

    return () => {
      events.forEach(event => window.removeEventListener(event, handleActivity));
    };
  }, [state.isAuthenticated]);

  // Interval Check für Timeouts & Silent Refresh
  useEffect(() => {
    if (!state.isAuthenticated) return;

    const intervalId = setInterval(() => {
      const now = Date.now();
      const timeSinceActivity = now - lastActivityRef.current;
      const timeSinceRefresh = now - lastRefreshRef.current;

      // 1. Silent Refresh Logic
      // Wenn User aktiv ist (idle < InactivityTimeout) UND Token alt genug -> Refresh
      if (timeSinceActivity < INACTIVITY_TIMEOUT_MS && timeSinceRefresh > REFRESH_INTERVAL_MS) {
        refreshAuthToken();
      }

      // 2. Inactivity Timeout Logic
      if (timeSinceActivity > INACTIVITY_TIMEOUT_MS) {
        // Timeout erreicht -> Logout
        logout();
      } else if (timeSinceActivity > (INACTIVITY_TIMEOUT_MS - WARNING_BEFORE_MS)) {
        // Warnung anzeigen
        const remaining = Math.ceil((INACTIVITY_TIMEOUT_MS - timeSinceActivity) / 1000);
        setTimeLeft(remaining);
        setShowTimeoutModal(true);
      } else {
        // Alles grün
        if (showTimeoutModal) setShowTimeoutModal(false);
      }

    }, 1000); // Jede Sekunde prüfen

    return () => clearInterval(intervalId);
  }, [state.isAuthenticated, logout, refreshAuthToken, showTimeoutModal]);


  // Initial: Prüfe ob User bereits eingeloggt ist
  useEffect(() => {
    refreshUser();
  }, [refreshUser]);

  const value: AuthContextType = {
    ...state,
    login,
    logout,
    refreshUser,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
      <SessionTimeoutModal
        isOpen={showTimeoutModal && state.isAuthenticated}
        onLogout={logout}
        onStayLoggedIn={() => {
          lastActivityRef.current = Date.now();
          setShowTimeoutModal(false);
          refreshAuthToken(); // Token sofort refreshen zur Sicherheit
        }}
        timeLeft={timeLeft}
      />
    </AuthContext.Provider>
  );
}

/**
 * Hook zum Zugriff auf den Auth-Context.
 * Muss innerhalb eines AuthProviders verwendet werden.
 * 
 * @example
 * ```tsx
 * const { user, isAuthenticated, login, logout } = useAuth();
 * ```
 */
export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
