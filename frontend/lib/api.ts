// TO-DO: Funktion für jede Klasse, die Daten vom Backend holt oder schreibt


import { Anfrage } from './definitions';
import { refreshToken as refreshTokenInternal } from './token';

const PAGE_SIZE = 10; // Anzahl Einträge pro Seite

export async function fetchAnfragenPages(query: string): Promise<number> {
  try {
    // Beispiel-API: /api/anfragen?search=...&page_size=10
    const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
    const res = await apiFetch(`${backendUrl}/api/anfragen?search=${encodeURIComponent(query)}&page_size=${PAGE_SIZE}`, {
      credentials: 'include'
    });
    if (!res.ok) {
      throw new Error('Fehler beim Laden der Anfragen');
    }

    let data: { count: number; results: Anfrage[] };
    try {
      const bodyText = await res.text();
      data = JSON.parse(bodyText);
    } catch (e) {
      console.error("fetchAnfragenPages: Invalid JSON response");
      throw new Error("Invalid server response");
    }
    // count = Gesamtanzahl der Anfragen → daraus die Gesamtseiten berechnen
    return Math.ceil(data.count / PAGE_SIZE);
  } catch (error) {
    console.error(error);
    return 1; // fallback auf 1 Seite
  }
}

export async function fetchAnfrage(query: string, page: number) {
  try {
    const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
    const res = await apiFetch(
      `${backendUrl}/api/anfragen?search=${encodeURIComponent(query)}&page=${page}&page_size=${PAGE_SIZE}`,
      { credentials: 'include' }
    );

    if (!res.ok) throw new Error("Fehler beim Laden der Anfragen");

    let data: { count: number; results: Anfrage[] };
    try {
      const bodyText = await res.text();
      data = JSON.parse(bodyText);
    } catch (e) {
      console.error("fetchAnfrage: Invalid JSON response");
      throw new Error("Invalid server response");
    }
    return data.results;     // <-- WICHTIG!
  } catch (error) {
    console.error(error);
    return [];              // leeres Array statt Seitenzahl
  }
}

const backendUrl =
  process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export async function apiFetch(
  input: string,
  init: RequestInit = {}
) {
  // Token handling: try localStorage first, then cookie (if needed)
  let token = typeof localStorage !== 'undefined' ? localStorage.getItem("accessToken") : null;

  // If not in localStorage, check cookie (fallback)
  if (!token && typeof document !== 'undefined') {
    const match = document.cookie.match(new RegExp('(^| )accessToken=([^;]+)'));
    if (match) token = match[2];
  }

  const headers = new Headers(init.headers || {});
  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  // Ensure full URL
  const url = input.startsWith("http") ? input : `${backendUrl}${input}`;

  let res = await fetch(url, {
    ...init,
    headers,
    credentials: 'include',
  });

  // Access Token abgelaufen?
  if (res.status === 401) {
    try {
      const newAccessToken = await refreshTokenInternal();

      // Update header with new token
      headers.set("Authorization", `Bearer ${newAccessToken}`);

      // Retry original request using the same normalized URL
      res = await fetch(url, {
        ...init,
        headers,
        credentials: 'include',
      });
    } catch (error) {
      console.error("Token Refresh failed in apiFetch", error);
      throw new Error('Session abgelaufen');
    }
  }

  return res;
}
