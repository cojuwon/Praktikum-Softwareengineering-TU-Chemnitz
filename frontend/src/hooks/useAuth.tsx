'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { User, AuthState } from '@/src/types/auth';

// API Base URL - sollte in einer .env Datei konfiguriert werden
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

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
  }, []);

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
