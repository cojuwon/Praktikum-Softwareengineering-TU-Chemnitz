// TO-DO: Funktion für jede Klasse, die Daten vom Backend holt oder schreibt

/*
import { Anfrage } from './definitions';

const PAGE_SIZE = 10; // Anzahl Einträge pro Seite

export async function fetchAnfragenPages (query: string): Promise<number> {
  try {
    // Beispiel-API: /api/anfragen?search=...&page_size=10
    const res = await fetch(`/api/anfragen?search=${encodeURIComponent(query)}&page_size=${PAGE_SIZE}`);
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
    const res = await fetch(
      `/api/anfragen?search=${encodeURIComponent(query)}&page=${page}&page_size=${PAGE_SIZE}`
    );

    if (!res.ok) throw new Error("Fehler beim Laden der Anfragen");

    const data: { count: number; results: Anfrage[] } = await res.json();
    return data.results;     // <-- WICHTIG!
  } catch (error) {
    console.error(error);
    return [];              // leeres Array statt Seitenzahl
  }
}*/

// TO-DO: Funktion für jede Klasse, die Daten vom Backend holt oder schreibt


import { Anfrage, Fall } from './definitions';

const PAGE_SIZE = 10; // Anzahl Einträge pro Seite

export async function fetchAnfragenPages (query: string): Promise<number> {
  try {
    // Beispiel-API: /api/anfragen?search=...&page_size=10
    const res = await fetch(`/api/anfragen?search=${encodeURIComponent(query)}&page_size=${PAGE_SIZE}`);
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
    const res = await fetch(
      `/api/anfragen?search=${encodeURIComponent(query)}&page=${page}&page_size=${PAGE_SIZE}`
    );

    if (!res.ok) throw new Error("Fehler beim Laden der Anfragen");

    const data: { count: number; results: Anfrage[] } = await res.json();
    return data.results;     // <-- WICHTIG!
  } catch (error) {
    console.error(error);
    return [];              // leeres Array statt Seitenzahl
  }
}

export async function fetchFallPages(query: string): Promise<number> {
  try {
    const res = await fetch(
      `/api/fall?search=${encodeURIComponent(query)}&page_size=${PAGE_SIZE}`
    );

    if (!res.ok) {
      throw new Error('Fehler beim Laden der Fälle');
    }

    const data: { count: number; results: Fall[] } = await res.json();
    return Math.ceil(data.count / PAGE_SIZE);
  } catch (error) {
    console.error(error);
    return 1; // fallback
  }
}

export async function fetchFall(query: string, page: number): Promise<Fall[]> {
  try {
    const res = await fetch(
      `/api/fall?search=${encodeURIComponent(query)}&page=${page}&page_size=${PAGE_SIZE}`
    );

    if (!res.ok) throw new Error('Fehler beim Laden der Fälle');

    const data: { count: number; results: Fall[] } = await res.json();
    return data.results;
  } catch (error) {
    console.error(error);
    return [];
  }
}

export async function deleteFall(id: number) {
  const res = await fetch(`/api/fall/${id}`, {
    method: "DELETE",
  });

  if (!res.ok) {
    throw new Error("Fehler beim Löschen des Falls");
  }
}

export async function createFall(fallData: Fall): Promise<Fall> {
  const res = await fetch(`/api/fall`, {
    method: "POST",
    body: JSON.stringify(fallData),
  });
  return await res.json();
}


export async function updateFall(fallData: Fall): Promise<Fall> {
  const res = await fetch(`/api/fall/${fallData.fall_id}`, {
    method: "PUT",
    body: JSON.stringify(fallData),
  });
  return await res.json();
}

export async function fetchFallById(id: number): Promise<Fall> {
  try {
    const res = await fetch(`/api/fall/${id}`);

    if (!res.ok) {
      throw new Error(`Fall mit ID ${id} nicht gefunden`);
    }

    return await res.json();
  } catch (error) {
    console.error('Fehler beim Laden des Falls:', error);
    throw error;
  }
}