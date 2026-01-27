'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { getCurrentUser } from '@/lib/auth';

type User = {
  id: number;
  rolle_mb: 'A' | 'E' | 'B';
  mail_mb: string;
};

type UserContextType = {
  user: User | null;
  loading: boolean;
  setUser: (u: User | null) => void;
};

const UserContext = createContext<UserContextType | null>(null);

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getCurrentUser()
      .then(u => {
        setUser(u);
        setLoading(false);
      })
      .catch(() => {
        setUser(null);
        setLoading(false);
      });
  }, []);

  return (
    <UserContext.Provider value={{ user, loading, setUser }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const ctx = useContext(UserContext);
  if (!ctx) {
    throw new Error('useUser must be used within UserProvider');
  }
  return ctx;
}

/*'use client';

import { createContext, useContext, useEffect, useState } from 'react';

type User = {
  id: number;
  vorname_mb: string;
  nachname_mb: string;
  rolle_mb: string;
};

const UserContext = createContext<{
  user: User | null;
  loading: boolean;
  setUser: (u: User | null) => void;
}>({
  user: null,
  loading: true,
  setUser: () => {},
});

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/users/me/', { credentials: 'include' })
      .then(res => (res.ok ? res.json() : null))
      .then(setUser)
      .finally(() => setLoading(false));
  }, []);

  return (
    <UserContext.Provider value={{ user, loading, setUser }}>
      {children}
    </UserContext.Provider>
  );
}

export const useUser = () => useContext(UserContext);
*/