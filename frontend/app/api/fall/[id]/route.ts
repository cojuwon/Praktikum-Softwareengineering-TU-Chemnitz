// app/api/fall/[id]/route.ts

import { NextResponse } from "next/server";

// ---- Fake-Datenbank (dieselbe wie in /query) ----
let fakeFaelle = [
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

// ---- GET: Einzelnen Fall abrufen ----
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const { id } = params;

  const fall = fakeFaelle.find((f) => f.id === id);

  if (!fall) {
    return NextResponse.json(
      { success: false, error: "Fall nicht gefunden" },
      { status: 404 }
    );
  }

  return NextResponse.json({ success: true, data: fall });
}

// ---- PUT: Fall aktualisieren ----
export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  const { id } = params;
  const updatedData = await request.json();

  const index = fakeFaelle.findIndex((f) => f.id === id);

  if (index === -1) {
    return NextResponse.json(
      { success: false, error: "Fall nicht gefunden" },
      { status: 404 }
    );
  }

  // neuen Zustand speichern
  fakeFaelle[index] = {
    ...fakeFaelle[index],
    ...updatedData,
  };

  return NextResponse.json({
    success: true,
    message: "Fall erfolgreich aktualisiert",
    data: fakeFaelle[index],
  });
}
