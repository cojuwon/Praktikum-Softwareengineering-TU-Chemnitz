import { NextResponse } from "next/server";

let savedCases: any[] = [];

// GET /api/fall
export async function GET() {
  return NextResponse.json({
    fields: [
      { name: "vorname", label: "Vorname", type: "text", required: true },
      { name: "nachname", label: "Nachname", type: "text", required: true },
      { name: "geburtsdatum", label: "Geburtsdatum", type: "date", required: false },
      {
        name: "anliegen",
        label: "Anliegen",
        type: "select",
        options: ["Beratung", "Information", "Termin"],
        required: true,
      },
      {
        name: "themen",
        label: "Themen",
        type: "multiselect",
        options: ["Rechtliches", "Sozial", "Finanzielles", "Sonstiges"],
        required: false,
      },
    ],
  });
}

// POST /api/fall
export async function POST(request: Request) {
  const data = await request.json();

  const fakeId = Math.floor(Math.random() * 1000000);

  const saved = {
    id: fakeId,
    ...data,
    createdAt: new Date().toISOString(),
  };

  savedCases.push(saved);

  return NextResponse.json({
    message: "Fall erfolgreich gespeichert (Fake API)",
    fall: saved,
  });
}

