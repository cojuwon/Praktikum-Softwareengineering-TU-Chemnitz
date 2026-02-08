// lib/auth.ts
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

interface User {
  id: number;
  vorname_mb: string;
  nachname_mb: string;
  mail_mb: string;
  rolle_mb: 'B' | 'E' | 'A'; // Basis, Erweiterung, Admin
}

/**
 * Login
 */

export async function login(email: string, password: string) {
  const res = await fetch(`${API_URL}/api/auth/login/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ email, password }),
  });

  if (!res.ok) {
    const err = await res.json();
    throw new Error(err?.detail || 'Login fehlgeschlagen');
  }

  const data = await res.json();

  // ⚠️ ACCESSTOKEN + REFRESH TOKEN (Rotation)
  // Expiry Logic: 2 hours (match backend)
  const expiryDate = new Date().getTime() + 2 * 60 * 60 * 1000;

  // Persist tokens for restarts
  if (typeof localStorage !== 'undefined') {
    localStorage.setItem('accessToken', data.access);
    localStorage.setItem('refreshToken', data.refresh);
    localStorage.setItem('sessionExpiry', expiryDate.toString());
  }

  return data;
}


/*
export async function login({ email, password }: { email: string; password: string }): Promise<User> {
  const res = await fetch(`${API_URL}/api/auth/login/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData?.detail || 'Login fehlgeschlagen');
  }

  const data = await res.json();

  localStorage.setItem('accessToken', data.access);
  localStorage.setItem('refreshToken', data.refresh);

  return data.user;
}*/

/**
 * Registrierung
 */
export async function register(payload: {
  email: string;
  password1: string;
  password2: string;
  vorname_mb: string;
  nachname_mb: string;
}): Promise<User> {
  const res = await fetch(`${API_URL}/api/auth/registration/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData?.detail || 'Registrierung fehlgeschlagen');
  }

  const data = await res.json();

  // Optional Auto-Login
  localStorage.setItem('accessToken', data.access);
  localStorage.setItem('refreshToken', data.refresh);

  return data.user;
}


/** ====================
 * LOGOUT
 * ==================== */

// lib/auth.ts
export async function logout() {
  const API_URL =
    process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

  const res = await fetch(`${API_URL}/api/auth/logout/`, {
    method: 'POST',
    credentials: 'include', // wichtig für Cookies
  });

  if (!res.ok) {
    throw new Error('Logout fehlgeschlagen');
  }

  // Clear local storage and cookies
  if (typeof localStorage !== 'undefined') {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('sessionExpiry');
  }
  document.cookie = 'accessToken=; Max-Age=0; path=/';
  document.cookie = 'refreshToken=; Max-Age=0; path=/';

  return true;
}

import { apiFetch } from './api';

export async function getCurrentUser(): Promise<User> {
  const res = await apiFetch('/api/auth/user/', {
    method: 'GET',
    // credentials: 'include' is handled by apiFetch
  });

  if (!res.ok) {
    throw new Error('Nicht eingeloggt');
  }

  return res.json();
}
/*

export async function logout() {
  await fetch(`${API_URL}/api/auth/logout/`, {
    method: 'POST',
    credentials: 'include',
  });

  // Cookies löschen
  document.cookie = 'accessToken=; Max-Age=0; path=/';
  document.cookie = 'refreshToken=; Max-Age=0; path=/';

  window.location.href = '/login';
}
*/


/*
export async function logout() {
  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

  const res = await fetch(`${API_URL}/api/auth/logout/`, {
    method: 'POST',
    credentials: 'include', // wenn Session-Cookie genutzt wird
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData?.detail || 'Logout fehlgeschlagen');
  }

  return res.json();
}
*/


/*
export function logout() {
  localStorage.removeItem('accessToken');
  localStorage.removeItem('refreshToken');
  
}*/

/**
 * Passwort ändern (eingeloggt)
 */
export async function changePassword(payload: {
  old_password: string;
  new_password1: string;
  new_password2: string;
}) {
  const accessToken = localStorage.getItem('accessToken');
  if (!accessToken) throw new Error('Nicht eingeloggt');

  const res = await fetch(`${API_URL}/api/auth/password/change/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData?.detail || 'Passwortänderung fehlgeschlagen');
  }
}

/**
 * Passwort zurücksetzen (Forgot Password)
 */
export async function resetPassword(email: string) {
  const res = await fetch(`${API_URL}/api/auth/password/reset/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email }),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData?.detail || 'Passwort zurücksetzen fehlgeschlagen');
  }
}

/**
 * Passwort Reset bestätigen (per Link aus Email)
 */
export async function confirmResetPassword(payload: {
  uid: string;
  token: string;
  new_password1: string;
  new_password2: string;
}) {
  const res = await fetch(`${API_URL}/api/auth/password/reset/confirm/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData?.detail || 'Passwort-Reset bestätigen fehlgeschlagen');
  }
}

/**
 * Access Token erneuern
 */
export async function refreshToken(): Promise<string> {
  const refresh = localStorage.getItem('refreshToken');
  if (!refresh) throw new Error('Kein Refresh-Token vorhanden');

  const res = await fetch(`${API_URL}/api/auth/token/refresh/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refresh }),
  });

  if (!res.ok) {
    throw new Error('Token konnte nicht erneuert werden');
  }

  const data = await res.json();

  // TOKEN ROTATION: Backend returns new access AND refresh token
  if (typeof localStorage !== 'undefined') {
    localStorage.setItem('accessToken', data.access);
    if (data.refresh) {
      localStorage.setItem('refreshToken', data.refresh);
    }

    // Reset Expiry to +2 hours
    const expiryDate = new Date().getTime() + 2 * 60 * 60 * 1000;
    localStorage.setItem('sessionExpiry', expiryDate.toString());
  }

  return data.access;
}

/**
 * Token prüfen (optional)
 */
export async function verifyToken(token: string): Promise<boolean> {
  const res = await fetch(`${API_URL}/api/auth/token/verify/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ token }),
  });

  return res.ok;
}





/*const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export async function login({ email, password }: { email: string; password: string }) {
  // 1. Login Request
  const response = await fetch(`${API_URL}/api/auth/login/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData?.detail || 'Login fehlgeschlagen');
  }

  const data = await response.json();

 

  // Token speichern (Memory oder localStorage)
  localStorage.setItem('accessToken', data.access);
  localStorage.setItem('refreshToken', data.refresh);

  return data.user;
}

export function logout() {
  localStorage.removeItem('accessToken');
  localStorage.removeItem('refreshToken');
}

export async function register({
  email,
  password1,
  password2,
  vorname_mb,
  nachname_mb,
}: {
  email: string;
  password1: string;
  password2: string;
  vorname_mb: string;
  nachname_mb: string;
}) {
  const response = await fetch(`${API_URL}/api/auth/registration/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password1, password2, vorname_mb, nachname_mb }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData?.detail || 'Registrierung fehlgeschlagen');
  }

  const data = await response.json();

  // Optional: Tokens speichern oder Auto-Login
  // localStorage.setItem('accessToken', data.access);
  // localStorage.setItem('refreshToken', data.refresh);

  return data.user;
}



*/

/*

export async function refreshToken() { ... }

export async function changePassword(payload) {
  const accessToken = localStorage.getItem('accessToken');

  const res = await fetch(`${API_URL}/api/auth/password/change/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) throw new Error('Password change failed');
}
export async function resetPassword(email) { ... }
export async function confirmResetPassword(data) { ... }
*/