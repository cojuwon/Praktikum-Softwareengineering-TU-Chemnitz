// TO-DO: Funktion für jede Klasse, die Daten vom Backend holt oder schreibt


import { Anfrage } from './definitions';

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

    const data: { count: number; results: Anfrage[] } = await res.json();
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

    const data: { count: number; results: Anfrage[] } = await res.json();
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
  let res = await fetch(`${backendUrl}${input}`, {
    ...init,
    credentials: 'include',
  });

  // Access Token abgelaufen?
  if (res.status === 401) {
    const refreshRes = await fetch(`${backendUrl}/api/auth/token/refresh/`, {
      method: 'POST',
      credentials: 'include',
    });

    if (!refreshRes.ok) {
      throw new Error('Session abgelaufen');
    }

    // Retry ursprüngliche Anfrage
    res = await fetch(`${backendUrl}${input}`, {
      ...init,
      credentials: 'include',
    });
  }

  return res;
}

