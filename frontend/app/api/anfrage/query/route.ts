

/*

import { NextResponse } from "next/server";

// ---- FAKE-DATENBANK ----
const fakeFaelle = [
  {
    id: "1",
    name: "Müller",
    datum: "2024-02-01",
    beschreibung: "Beratung zu Wohnungsfragen",
  },
  {
    id: "2",
    name: "Schmidt",
    datum: "2024-02-05",
    beschreibung: "Unterstützung beim Ausfüllen von Formularen",
  },
  {
    id: "3",
    name: "Meier",
    datum: "2024-03-01",
    beschreibung: "Erstkontakt",
  },
];

// ---- HELFER: DATUM VERGLEICH ----
function isInRange(date: string, from?: string, to?: string): boolean {
  if (from && date < from) return false;
  if (to && date > to) return false;
  return true;
}

// ---- POST: Fälle anhand Filter suchen ----
export async function POST(request: Request) {
  const filters = await request.json();

  const { datumVon, datumBis, name, anfrageId } = filters;

  // ---- FILTER LOGIK ----
  let result = fakeFaelle.filter((anfrage) => {
    const matchId = anfrageId ? anfrage.id === anfrageId : true;
    const matchName = name ? anfrage.name.toLowerCase().includes(name.toLowerCase()) : true;
    const matchDate = isInRange(anfrage.datum, datumVon, datumBis);

    return matchId && matchName && matchDate;
  });

  return NextResponse.json({
    success: true,
    count: result.length,
    data: result,
  });
}
*/