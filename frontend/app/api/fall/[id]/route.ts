// app/api/fall/[id]/route.ts
import { NextResponse } from "next/server";

// ----------------------------------
// Fake Felddefinitionen (global)
let fieldDefinitions = [
  { name: "name", label: "Name", type: "text", required: true },
  { name: "datum", label: "Datum", type: "date", required: true },
  { name: "beschreibung", label: "Beschreibung", type: "text" },
  { name: "status", label: "Status", type: "select", options: ["offen", "in_bearbeitung", "abgeschlossen"] },
];

// ----------------------------------
// Fake Fälle
let fakeFaelle: Record<string, any> = {
  "1": {
    values: {
      name: "Müller",
      datum: "2024-02-01",
      beschreibung: "Beratung zu Wohnungsfragen",
      status: "offen",
    },
    beratungstermine: [
      { datum: "2024-02-01", form: "Telefonisch" }
    ],
  },
  "2": {
    values: {
      name: "Schmidt",
      datum: "2024-03-05",
      beschreibung: "Formularhilfe",
      status: "in_bearbeitung",
    },
    beratungstermine: [],
  },
};

// ----------------------------------
// GET → Fall + Felddefinitionen laden
export async function GET(_req: Request, context: { params: any }) {
  const { id } = await context.params; // ✅ unwrap params
  const fall = fakeFaelle[id];

  if (!fall) {
    return NextResponse.json({ error: "Fall nicht gefunden" }, { status: 404 });
  }

  return NextResponse.json({
    fields: fieldDefinitions,
    values: fall.values,
    beratungstermine: fall.beratungstermine,
  });
}

// ----------------------------------
// PUT → Fall speichern
export async function PUT(req: Request, context: { params: any }) {
  const { id } = await context.params; // ✅ unwrap params
  const updatedValues = await req.json();

  if (!fakeFaelle[id]) {
    return NextResponse.json({ error: "Fall nicht gefunden" }, { status: 404 });
  }

  fakeFaelle[id] = {
    ...fakeFaelle[id],
    values: {
      ...fakeFaelle[id].values,
      ...updatedValues.values,
    },
    beratungstermine: updatedValues.beratungstermine ?? fakeFaelle[id].beratungstermine,
  };

  console.log("Fall gespeichert:", id, fakeFaelle[id]);

  return NextResponse.json({
    success: true,
    values: fakeFaelle[id].values,
    beratungstermine: fakeFaelle[id].beratungstermine,
  });
}
